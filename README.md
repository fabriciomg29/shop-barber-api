# Shop Barber API

API REST para gestão de barbearias. Construída com **NestJS**, **Prisma** e **PostgreSQL**, pronta para rodar via **Docker**.

## Stack

| Camada | Tecnologia |
|---|---|
| Framework | NestJS 11 + TypeScript |
| ORM | Prisma 7 |
| Banco de dados | PostgreSQL 16 |
| Runtime | Node.js 22 |
| Containerização | Docker + Docker Compose |

---

## Arquitetura

A aplicação segue a arquitetura modular do NestJS. Cada domínio de negócio possui seu próprio módulo isolado. O acesso ao banco é centralizado no `PrismaModule`, que é global e injetado em qualquer módulo sem necessidade de importação explícita.

```
src/
├── prisma/                  # PrismaService (global) + PrismaModule
├── barbearia/               # Cadastro da barbearia e configurações
├── usuario/                 # Usuários do sistema (dono, barbeiro)
├── barbeiro/                # Perfil, jornada e ponto do barbeiro
├── servico/                 # Catálogo de serviços oferecidos
├── cliente/                 # Cadastro de clientes (com token LGPD)
├── agendamento/             # Agendamentos, encaixes e trocas
├── atendimento/             # Atendimentos finalizados e caixa
├── estoque/                 # Produtos, fornecedores e movimentações
├── financeiro/              # Pagamento de comissões
├── comunicado/              # Comunicados internos entre equipe
└── notificacao/             # Log de notificações WhatsApp
```

### Módulos de domínio

| Módulo | Responsabilidade |
|---|---|
| `BarbeariaModule` | Configurações gerais, horários de funcionamento, metas e fidelidade |
| `UsuarioModule` | Controle de acesso (roles: `dono`, `barbeiro`) |
| `BarbeiroModule` | Perfil do barbeiro, jornada semanal (`JornadaBarbeiro`) e ponto diário (`PontoDia`) |
| `ServicoModule` | Catálogo de serviços com slug único por barbearia |
| `ClienteModule` | Cadastro com token de acesso, programa de fidelidade e controle LGPD |
| `AgendamentoModule` | Agenda, fila de encaixes (walk-in) e solicitações de troca entre barbeiros |
| `AtendimentoModule` | Registro de atendimentos finalizados, combos de serviços/produtos e sessão de caixa |
| `EstoqueModule` | Produtos, fornecedores, consumo por serviço, movimentações e pedidos a fornecedores |
| `FinanceiroModule` | Acertos de comissão com barbeiros |
| `ComunicadoModule` | Comunicados internos com controle de leitura por barbeiro |
| `NotificacaoModule` | Fila e log de envio de notificações WhatsApp |

### Fluxo de uma requisição

Toda requisição percorre sempre o mesmo caminho: **HTTP → Controller → Service → PrismaService → PostgreSQL**. Não há camadas extras — sem repositórios, sem use cases, sem adapters.

```
GET /clientes?barbeariaId=abc&ativo=true&page=1&limit=20
        │
        ▼
ClienteController          (src/cliente/cliente.controller.ts)
  @Get()
  findAll(@Query() query: ClienteQueryDto)
  │  • Valida e transforma os query params via ClienteQueryDto
  │  • ClienteQueryDto estende PaginationDto (page, limit) e adiciona
  │    barbeariaId (UUID opcional) e ativo (boolean opcional)
  │  • Repassa os valores para o service
        │
        ▼
ClienteService             (src/cliente/cliente.service.ts)
  findAll(page, limit, barbeariaId?, ativo?)
  │  • Monta o objeto `where` com os filtros recebidos
  │  • ativo=true  → { inativoDesde: null }
  │  • ativo=false → { inativoDesde: { not: null } }
  │  • Executa duas queries em paralelo via Promise.all:
  │      prisma.cliente.findMany(...)   → página de registros
  │      prisma.cliente.count(...)      → total para paginação
  │  • Retorna paginated(data, total, page, limit)
        │
        ▼
PrismaService              (src/prisma/prisma.service.ts)
  │  • Estende PrismaClient com adaptador pg (PrismaPg)
  │  • É um serviço global — injetado em qualquer módulo sem
  │    precisar importar PrismaModule explicitamente
        │
        ▼
PostgreSQL                 (tabela `cliente`)
```

**Resposta:**

```json
{
  "data": [ /* array de clientes */ ],
  "total": 42,
  "page": 1,
  "limit": 20
}
```

---

#### Anatomia de um módulo

Cada domínio tem exatamente estes arquivos:

```
cliente/
├── cliente.module.ts       # declara controller e service do módulo
├── cliente.controller.ts   # mapeia rotas HTTP, valida entrada via DTOs
├── cliente.service.ts      # lógica de negócio, acessa o banco via PrismaService
└── dto/
    ├── create-cliente.dto.ts   # campos aceitos no POST
    └── update-cliente.dto.ts   # campos aceitos no PATCH (todos opcionais)
```

O **Module** registra o Controller e o Service. O **Controller** recebe a requisição HTTP, passa pelos pipes de validação do NestJS (`class-validator` + `class-transformer`), e delega ao **Service**. O **Service** é onde vive toda a lógica — queries, regras de negócio, lançamento de exceções (`NotFoundException`, etc.). O **PrismaService** é injetado diretamente no service e expõe os models do schema como propriedades tipadas (`this.prisma.cliente`, `this.prisma.agendamento`, etc.).

---

#### Como adicionar um novo endpoint

1. Crie ou edite o DTO em `dto/` com os campos e validações (`@IsString()`, `@IsUUID()`, etc.)
2. Adicione o método no **Service** — monte o `where`, chame `this.prisma.<model>.<método>()`
3. Adicione a rota no **Controller** com o decorator HTTP (`@Get`, `@Post`, etc.) e passe os params para o service
4. O NestJS registra a rota automaticamente — não há arquivo de rotas central

---

### Schema do banco

O schema completo está em `prisma/schema.prisma` e reflete o DDL de `init_schema.sql` (PostgreSQL 15+, compatível com Supabase).

**24 models · 15 enums**

```
Barbearia · Usuario · Barbeiro · JornadaBarbeiro · PontoDia
Servico · BarbeiroServico · Cliente
Agendamento · Encaixe · SolicitacaoTroca
Caixa · Atendimento · AtendimentoServico · AtendimentoProduto
Fornecedor · Produto · ConsumoServicoProduto
MovimentacaoEstoque · PedidoFornecedor · PedidoFornecedorItem
ComissaoPagamento · Comunicado · ComunicadoLeitura · NotificacaoWhatsapp
```

---

## Pré-requisitos

- [Node.js 22+](https://nodejs.org/)
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/) — para execução containerizada

---

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste conforme o ambiente:

```bash
cp .env.example .env
```

| Variável | Descrição | Padrão (Docker) |
|---|---|---|
| `DATABASE_URL` | Connection string PostgreSQL | `postgresql://postgres:postgres@db:5432/shop_barber?schema=public` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `PORT` | Porta da API | `3000` |

---

## Execução com Docker (recomendado)

Sobe a API e o PostgreSQL juntos. O `init_schema.sql` é executado automaticamente na primeira inicialização do banco.

```bash
# Build e start
docker compose up --build

# Apenas start (após o primeiro build)
docker compose up

# Em background
docker compose up -d --build
```

A API estará disponível em `http://localhost:3000`.

O banco persiste os dados no volume `postgres_data`. Para resetar completamente:

```bash
docker compose down -v
```

---

## Execução local (sem Docker)

Requer um PostgreSQL local ou remoto configurado no `.env`.

```bash
# 1. Instalar dependências
npm install

# 2. Gerar o Prisma Client
npx prisma generate

# 3. Aplicar o schema no banco
npx prisma migrate dev

# 4. Iniciar em modo watch
npm run start:dev
```

### Scripts disponíveis

```bash
npm run start:dev     # desenvolvimento com hot-reload
npm run start:debug   # desenvolvimento com debugger
npm run build         # compilar TypeScript
npm run start:prod    # iniciar a build compilada
npm run lint          # lint + auto-fix
npm run format        # formatar com Prettier
npm run test          # testes unitários
npm run test:e2e      # testes end-to-end
npm run test:cov      # cobertura de testes
```

---

## Prisma

```bash
# Gerar o client após alterar o schema
npx prisma generate

# Criar e aplicar uma nova migration
npx prisma migrate dev --name nome_da_migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Interface visual do banco
npx prisma studio
```

O arquivo de configuração do Prisma 7 fica em `prisma.config.ts`. A `DATABASE_URL` é lida da variável de ambiente — não é definida diretamente no `schema.prisma`.

---

## Estrutura de arquivos

```
shop-barber-api/
├── prisma/
│   ├── schema.prisma          # Schema completo (models + enums)
│   └── migrations/            # Histórico de migrations
├── prisma.config.ts           # Configuração do Prisma 7 (datasource URL)
├── src/
│   ├── main.ts
│   ├── app.module.ts
│   ├── prisma/
│   │   ├── prisma.service.ts  # PrismaClient com lifecycle hooks NestJS
│   │   └── prisma.module.ts   # Módulo global
│   ├── barbearia/
│   ├── usuario/
│   ├── barbeiro/
│   ├── servico/
│   ├── cliente/
│   ├── agendamento/
│   ├── atendimento/
│   ├── estoque/
│   ├── financeiro/
│   ├── comunicado/
│   └── notificacao/
├── init_schema.sql            # DDL PostgreSQL completo (fonte de verdade do schema)
├── Dockerfile                 # Build multi-stage (builder + runner, node:22-alpine)
├── docker-compose.yml         # API + PostgreSQL com healthcheck
├── .env                       # Variáveis locais (não versionado)
└── .env.example               # Template de variáveis
```
