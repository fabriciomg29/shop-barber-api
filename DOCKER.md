# Docker — Referência Rápida

Guia do Dockerfile e docker-compose deste projeto para consulta rápida.

---

## Visão Geral

```
docker compose up
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

O build tem **dois estágios** para manter a imagem de produção pequena e sem código-fonte.

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
EXPOSE 3000
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

## docker-compose.yml

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
    - "3000:3000"
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

## Comandos Úteis

```bash
# Subir tudo (build + start)
docker compose up --build

# Subir em background
docker compose up -d --build

# Ver logs da API em tempo real
docker compose logs -f api

# Ver logs do banco
docker compose logs -f db

# Parar tudo (mantém volumes)
docker compose down

# Parar e apagar o volume do banco (reset total)
docker compose down -v

# Entrar no container da API
docker compose exec api sh

# Entrar no banco via psql
docker compose exec db psql -U postgres -d shop_barber

# Rebuild só da imagem da API (sem subir)
docker compose build api

# Ver status dos containers
docker compose ps
```

---

## Variáveis de Ambiente

| Variável | Onde é definida | Valor |
|---|---|---|
| `DATABASE_URL` | `docker-compose.yml` → serviço `api` | `postgresql://postgres:postgres@db:5432/shop_barber?schema=public` |
| `NODE_ENV` | `docker-compose.yml` → serviço `api` | `production` |
| `POSTGRES_USER` | `docker-compose.yml` → serviço `db` | `postgres` |
| `POSTGRES_PASSWORD` | `docker-compose.yml` → serviço `db` | `postgres` |
| `POSTGRES_DB` | `docker-compose.yml` → serviço `db` | `shop_barber` |

Para sobrescrever em desenvolvimento, crie um arquivo `.env` na raiz e reference no `docker-compose.yml` com `env_file: .env`.

---

## Troubleshooting

**API sobe mas não conecta ao banco**
- Verifique se o `db` passou no healthcheck: `docker compose ps`
- Veja os logs do banco: `docker compose logs db`

**`prisma generate` falha no build**
- Confirme que `prisma/schema.prisma` existe e está correto
- A `DATABASE_URL` fictícia no Dockerfile é intencional — não substitua por uma URL real

**Mudanças no código não refletem no container**
- Rode `docker compose up --build` para forçar o rebuild da imagem

**Dados do banco sumiram**
- Se rodou `docker compose down -v`, o volume foi apagado — isso é destrutivo
- Use `docker compose down` (sem `-v`) para preservar os dados

**Porta 5432 ou 3000 já em uso**
- Outro processo está usando a porta. Pare-o ou altere o mapeamento no `docker-compose.yml` (ex: `"5433:5432"`)
