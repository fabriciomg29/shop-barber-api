# Docker — Referência Rápida

Guia do Dockerfile e docker-compose deste projeto para consulta rápida.

---

## Visão Geral

O projeto tem dois arquivos compose:

| Arquivo | Uso | Como roda |
|---|---|---|
| `docker-compose.prod.yml` | Produção | Build compilada → `node dist/main.js` |
| `docker-compose.dev.yml` | Desenvolvimento | Bind-mount do código → `nest start --watch` (sem rebuild) |

```
docker compose -f docker-compose.prod.yml up
       │
       ├─ 1. Sobe o banco Postgres (db)
       │       └─ Aguarda healthcheck passar
       │
       ├─ 2. Build da imagem da API (Dockerfile)
       │       ├─ [builder] instala deps → gera Prisma Client → compila TS
       │       └─ [runner]  copia só o necessário → imagem enxuta
       │
       └─ 3. Sobe a API
               └─ node dist/main.js → conecta ao Postgres via hostname `db`
```

---

## Dockerfile

O build tem **três estágios**: `dev` (desenvolvimento em watch mode) e o par `builder` + `runner` que mantém a imagem de produção pequena e sem código-fonte.

### Estágio `dev`

Usado pelo `docker-compose.dev.yml`. Instala **todas** as deps (incluindo `devDependencies` e o `@nestjs/cli`) e gera o Prisma Client. Não copia o código — ele vem por bind-mount em runtime, permitindo watch mode sem rebuild.

```dockerfile
FROM node:22-slim AS dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
COPY prisma.config.ts ./
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate
ENTRYPOINT ["./docker-entrypoint.dev.sh"]
```

> O `node_modules` (com o client gerado) fica baked na imagem e é preservado por um volume anônimo no compose, sem ser sobrescrito pelo bind-mount do host.

---

### Estágio 1 — `builder`

Compila o projeto e gera o Prisma Client.

```dockerfile
FROM node:22-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci
```

> `npm ci` é estrito: instala exatamente o que está no `package-lock.json`. Nunca atualiza versões.

```dockerfile
COPY prisma ./prisma
COPY prisma.config.ts ./

ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate
```

> `prisma generate` lê o schema e gera o client em `node_modules/.prisma` e `node_modules/@prisma`.
> Ele **não conecta ao banco** — a `DATABASE_URL` fictícia existe só para satisfazer a validação interna do Prisma.

```dockerfile
COPY . .
RUN npm run build

RUN test -f /app/dist/main.js || (echo "ERRO: dist/main.js não encontrado" && exit 1)
```

> `nest build` compila o TypeScript e gera `/app/dist/main.js`.
> O `test -f` é uma verificação explícita: se o arquivo não existir, o build falha com mensagem clara em vez de um erro críptico mais tarde.

---

**Por que copiar `package*.json` e `prisma/` antes do `COPY . .`?**

Cache de layer do Docker. Cada instrução gera uma camada, e o Docker reutiliza camadas que não mudaram.

```
COPY package*.json  →  RUN npm ci          ← só re-executa se package.json mudar
COPY prisma/        →  RUN prisma generate ← só re-executa se o schema mudar
COPY . .            →  RUN nest build      ← re-executa sempre que qualquer arquivo muda
```

Na prática: alterar só um arquivo `.ts` não reinstala dependências.

---

### Estágio 2 — `runner`

Imagem final. Parte do zero — não herda nada do `builder` além do que for copiado explicitamente.

```dockerfile
FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts
```

> `--omit=dev` exclui devDependencies (jest, ts-node, eslint, etc.).
> `--ignore-scripts` impede que o `postinstall` do Prisma tente rodar `prisma generate` sem o schema disponível.

```dockerfile
COPY --from=builder /app/dist              ./dist
COPY --from=builder /app/node_modules/.prisma  ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma  ./node_modules/@prisma
```

> O `dist/` é o código compilado.
> `.prisma/` e `@prisma/` são o Prisma Client gerado — eles **não** vêm do `npm install`, precisam ser copiados do `builder`.

```dockerfile
EXPOSE 4870
CMD ["node", "dist/main.js"]
```

A imagem final **não contém**: TypeScript, código-fonte, devDependencies, nem o schema Prisma.

---

## .dockerignore

Arquivos que **não** entram no contexto de build enviado ao Docker daemon.

| Entrada | Motivo |
|---|---|
| `node_modules/` | Serão reinstalados dentro do container |
| `dist/` | Será gerado pelo `nest build` |
| `.git/` | Histórico desnecessário na imagem |
| `.env` / `.env.*` | Nunca vazar secrets na imagem |
| `!.env.example` | Exceção — o arquivo de exemplo pode entrar |
| `coverage/` | Relatórios de teste são desnecessários |

---

## docker-compose.prod.yml

### Serviço `db`

```yaml
db:
  image: postgres:16-alpine
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    POSTGRES_DB: shop_barber       # banco criado automaticamente na 1ª inicialização
  ports:
    - "5432:5432"                  # expõe para o host — útil para DBeaver, psql local, etc.
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ./init_schema.sql:/docker-entrypoint-initdb.d/init_schema.sql
  healthcheck:
    test: ["CMD-SHELL", "pg_isready -U postgres -d shop_barber"]
    interval: 5s
    timeout: 5s
    retries: 10
```

**Volumes:**
- `postgres_data` — volume nomeado gerenciado pelo Docker. Os dados persistem mesmo derrubando e subindo os containers.
- `init_schema.sql` — executado **uma única vez**, quando o volume está vazio (primeira criação). Nos reinícios seguintes é ignorado.

**Healthcheck:** roda `pg_isready` a cada 5s, até 10 tentativas (50s no total). O serviço só é marcado como `healthy` quando o Postgres está aceitando conexões — não apenas quando o processo subiu.

---

### Serviço `api`

```yaml
api:
  build: .
  ports:
    - "4870:4870"
  environment:
    DATABASE_URL: postgresql://postgres:postgres@db:5432/shop_barber?schema=public
    NODE_ENV: production
  depends_on:
    db:
      condition: service_healthy
  restart: unless-stopped
```

> O hostname `db` na `DATABASE_URL` é resolvido pelo DNS interno do Docker Compose.
> Os containers se comunicam pela rede interna — o host nunca entra nessa comunicação.

`restart: unless-stopped` — reinicia automaticamente se o processo morrer, exceto quando parado manualmente com `docker compose stop`.

`depends_on: condition: service_healthy` — garante que a API só sobe depois que o Postgres passou no healthcheck. Sem isso, a API tentaria conectar antes do banco estar pronto e falharia.

---

## docker-compose.dev.yml

Ambiente de desenvolvimento em **watch mode**. Difere do de produção em três pontos:

```yaml
api:
  build:
    context: .
    target: dev                # usa o estágio `dev` do Dockerfile
  volumes:
    - .:/app                    # bind-mount do código → reflete alterações sem rebuild
    - /app/node_modules         # volume anônimo → preserva o node_modules da imagem
  environment:
    NODE_ENV: development
```

No start, o `docker-entrypoint.dev.sh` roda: `prisma generate` → `prisma migrate deploy` → seed → `npm run start:dev`. Ao salvar um arquivo em `src/`, o NestJS recompila e reinicia automaticamente — **sem rebuild da imagem**.

O banco usa um volume separado (`postgres_data_dev`), isolando os dados de dev dos de produção.

---

## Comandos Úteis

Os comandos abaixo usam o compose de produção (`-f docker-compose.prod.yml`). Para o ambiente de desenvolvimento, troque por `-f docker-compose.dev.yml`.

```bash
# Subir tudo (build + start)
docker compose -f docker-compose.prod.yml up --build

# Subir em background
docker compose -f docker-compose.prod.yml up -d --build

# Ver logs da API em tempo real
docker compose -f docker-compose.prod.yml logs -f api

# Ver logs do banco
docker compose -f docker-compose.prod.yml logs -f db

# Parar tudo (mantém volumes)
docker compose -f docker-compose.prod.yml down

# Parar e apagar o volume do banco (reset total)
docker compose -f docker-compose.prod.yml down -v

# Entrar no container da API
docker compose -f docker-compose.prod.yml exec api sh

# Entrar no banco via psql
docker compose -f docker-compose.prod.yml exec db psql -U postgres -d shop_barber

# Rebuild só da imagem da API (sem subir)
docker compose -f docker-compose.prod.yml build api

# Ver status dos containers
docker compose -f docker-compose.prod.yml ps

# Subir o ambiente de desenvolvimento (watch mode)
docker compose -f docker-compose.dev.yml up --build
```

---

## Variáveis de Ambiente

| Variável | Onde é definida | Valor |
|---|---|---|
| `DATABASE_URL` | `docker-compose.prod.yml` → serviço `api` | `postgresql://postgres:postgres@db:5432/shop_barber?schema=public` |
| `NODE_ENV` | `docker-compose.prod.yml` → serviço `api` | `production` (no dev: `development`) |
| `POSTGRES_USER` | `docker-compose.prod.yml` → serviço `db` | `postgres` |
| `POSTGRES_PASSWORD` | `docker-compose.prod.yml` → serviço `db` | `postgres` |
| `POSTGRES_DB` | `docker-compose.prod.yml` → serviço `db` | `shop_barber` |

Para sobrescrever, crie um arquivo `.env` na raiz e reference no compose com `env_file: .env`.

---

## Troubleshooting

**API sobe mas não conecta ao banco**
- Verifique se o `db` passou no healthcheck: `docker compose -f docker-compose.prod.yml ps`
- Veja os logs do banco: `docker compose -f docker-compose.prod.yml logs db`

**`prisma generate` falha no build**
- Confirme que `prisma/schema.prisma` existe e está correto
- A `DATABASE_URL` fictícia no Dockerfile é intencional — não substitua por uma URL real

**Mudanças no código não refletem no container**
- Em produção, a imagem é imutável: rode `docker compose -f docker-compose.prod.yml up --build` para forçar o rebuild
- Para desenvolvimento com reflexo automático, use `docker compose -f docker-compose.dev.yml up` (watch mode)
- No dev sob WSL2, se o watch não disparar, descomente `CHOKIDAR_USEPOLLING: "true"` no `docker-compose.dev.yml`

**Dados do banco sumiram**
- Se rodou `docker compose ... down -v`, o volume foi apagado — isso é destrutivo
- Use `docker compose ... down` (sem `-v`) para preservar os dados

**Porta 5432 ou 4870 já em uso**
- Outro processo está usando a porta. Pare-o ou altere o mapeamento no compose (ex: `"5433:5432"`)
