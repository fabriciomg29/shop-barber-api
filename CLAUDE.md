# CLAUDE.md

Contexto para o Claude Code trabalhar nesta API. Mantenha enxuto — este arquivo é carregado a cada sessão.

## Visão geral

API REST de **gestão de barbearias** (Shop Barber). Stack: **NestJS 11 + Prisma 7 + PostgreSQL 16**, Node 22, pronta para Docker. Todo o domínio e a documentação são em **português** — siga essa convenção em nomes, mensagens e comentários.

## Comandos essenciais

```bash
npm run start:dev      # dev com hot-reload (porta 4870)
npm run build          # format + seed:build + nest build
npm run start:prod     # roda a build compilada (dist/main)
npm run lint           # eslint --fix
npm run format         # prettier --write
npm test               # testes unitários (*.spec.ts)
npm run test:e2e       # testes end-to-end
npm run test:cov       # cobertura

npx prisma generate                       # gerar client após mudar o schema
npx prisma migrate dev --name <nome>      # criar + aplicar migration (dev)
npx prisma migrate deploy                 # aplicar migrations (prod)
npx prisma studio                         # UI do banco
npm run seed                              # popular o banco

docker compose -f docker-compose.dev.yml up   # ambiente dev em watch (ver DOCKER.md)
```

## Arquitetura

Modular por domínio. O fluxo é **sempre fixo** e sem camadas extras (sem repositórios, use-cases ou adapters):

```
HTTP → Controller → Service → PrismaService → PostgreSQL
```

Anatomia de cada módulo (ex.: `src/cliente/`):

```
x.module.ts      # registra controller + service
x.controller.ts  # mapeia rotas HTTP, valida entrada via DTO, delega ao service
x.service.ts     # toda a lógica de negócio + acesso ao banco (this.prisma.<model>)
dto/
  create-x.dto.ts
  update-x.dto.ts
```

- **Controller só recebe/valida/delega** — nenhuma regra de negócio nele. Tudo vai no **Service**.
- `PrismaModule` é `@Global()`: `PrismaService` é injetável em qualquer módulo **sem precisar importar** o módulo.
- Domínios: `barbearia`, `usuario`, `barbeiro`, `servico`, `cliente`, `agendamento`, `atendimento`, `estoque`, `financeiro`, `comunicado`, `notificacao`, `dashboard`.

## Autenticação

Guards **globais** em `src/app.module.ts` (`JwtAuthGuard` + `RolesGuard`) → **toda rota exige JWT válido por padrão**. Ajuste com os decorators de `src/auth/decorators/`:

- `@Public()` — libera a rota sem login (ex.: login, cadastro público).
- `@Roles('dono' | 'barbeiro')` — restringe por papel.
- `@CurrentUser()` — injeta o payload do token no parâmetro do controller.

Detalhes em `docs/autenticacao-jwt.md`.

## Convenções de código

Configuração Prettier (`.prettierrc`) — o ponto mais fácil de errar:

- **Sem ponto e vírgula** (`semi: false`), **aspas simples**, `trailingComma: all`, `printWidth: 100`, 2 espaços.
- Sempre rode `npm run format` / `npm run lint` após editar.

Padrões:

- Validação via DTO com `class-validator` (`@IsString`, `@IsUUID`, `@IsOptional`, etc.). O `ValidationPipe` global usa `whitelist` (remove campos fora do DTO) + `transform`.
- `UpdateXDto extends PartialType(CreateXDto)` — todos os campos opcionais para o PATCH.
- Paginação via `PaginationDto` (`src/common/dto/pagination.dto.ts`); a resposta paginada segue `{ data, total, page, limit }`.
- Tipos compartilhados ficam em `libs/types/`.
- Swagger: decore com `@ApiTags`, `@ApiOperation`, `@ApiPropertyOptional`. Doc disponível em `/api`.

## Como adicionar um endpoint

1. Crie/edite o DTO em `dto/` com os campos e validações.
2. Adicione o método no **Service** (monte o `where`, chame `this.prisma.<model>.<metodo>()`, lance `NotFoundException` etc.).
3. Adicione a rota no **Controller** com o decorator HTTP (`@Get`, `@Post`, …) e passe os params ao service.

O NestJS registra a rota automaticamente — não há arquivo de rotas central.

## Schema / banco

- Fonte do schema: `prisma/schema.prisma` (24 models, 15 enums); o DDL equivalente está em `init_schema.sql`.
- `prisma.config.ts` (Prisma 7) lê `DATABASE_URL` do ambiente — não fica no `schema.prisma`.
- `PrismaService` (`src/prisma/prisma.service.ts`) estende `PrismaClient` com o adaptador `pg` e gerencia o lifecycle (`onModuleInit`/`onModuleDestroy`).

## Documentação relacionada

- `README.md` — setup completo, scripts, arquitetura detalhada e schema.
- `DOCKER.md` — execução em containers (dev e prod).
- `docs/estrutura-nestjs.md` — decorators e fluxo de requisição explicados.
- `docs/autenticacao-jwt.md` — autenticação JWT.
- `docs/regras-de-negocio.md` — regras de domínio.
- `CLAUDE-FRONTEND.md` — contexto do frontend que consome esta API.
