# Estrutura do NestJS e Decorators

Guia explicando a arquitetura do NestJS usando o próprio código do **Shop Barber API**.

## A ideia central do NestJS

NestJS é organizado em **módulos**, e cada módulo geralmente tem três peças que se separam por responsabilidade:

```
Requisição HTTP
      │
      ▼
┌──────────────┐   "que rota é essa e quais dados chegaram?"
│  Controller  │   → recebe a requisição, valida o input (DTO)
└──────┬───────┘
       │ chama
       ▼
┌──────────────┐   "regra de negócio + acesso ao banco"
│   Service    │   → faz a lógica, fala com o Prisma
└──────┬───────┘
       │ usa
       ▼
┌──────────────┐
│ PrismaService│   → banco de dados
└──────────────┘
```

Tudo isso é "colado" por **decorators** — aquelas anotações com `@` que dão metadados pro NestJS saber o que cada classe/método é.

---

## 1. `main.ts` — o ponto de entrada

```ts
const app = await NestFactory.create(AppModule)
app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
await app.listen(process.env.PORT ?? 4870)
```

Aqui o Nest "liga o motor" a partir do `AppModule`. Dois detalhes importantes:

- `whitelist: true` → remove do payload qualquer campo que **não** esteja no DTO.
- `transform: true` → converte os dados pro tipo certo (ex: string `"true"` da query vira `boolean`).

---

## 2. Decorators de estrutura (a "cola" do Nest)

### `@Module()` — agrupa funcionalidades

`src/cliente/cliente.module.ts`:

```ts
@Module({
  controllers: [ClienteController],   // quem expõe rotas
  providers: [ClienteService],        // quem pode ser injetado
})
export class ClienteModule {}
```

E o `AppModule` é o módulo raiz que importa todos os outros:

```ts
@Module({
  imports: [ConfigModule.forRoot(...), PrismaModule, AuthModule, ClienteModule, ...],
})
```

### `@Controller('clientes')` — define um grupo de rotas

Todo método dentro dele responde sob `/clientes`.

### `@Injectable()` — marca uma classe como "injetável"

```ts
@Injectable()
export class ClienteService {
  constructor(private readonly prisma: PrismaService) {}
}
```

Esse `@Injectable()` é o que permite a **injeção de dependência**: você só declara `prisma: PrismaService` no construtor e o Nest entrega a instância pronta. Você nunca dá `new ClienteService()` — o Nest gerencia isso.

### `@Global()` — o caso do Prisma

```ts
@Global()
@Module({ providers: [PrismaService], exports: [PrismaService] })
export class PrismaModule {}
```

Normalmente, pra um módulo usar um service de outro, ele precisa **importar** aquele módulo. O `@Global()` faz o `PrismaService` ficar disponível em **todo** o app sem precisar importar em cada lugar — por isso o `ClienteModule` consegue injetar `PrismaService` sem importar o `PrismaModule`.

---

## 3. Decorators de rota (no Controller)

No `cliente.controller.ts`:

| Decorator | O que faz |
|-----------|-----------|
| `@Post()` | responde a `POST /clientes` |
| `@Get()` | responde a `GET /clientes` |
| `@Get(':id')` | rota com parâmetro: `GET /clientes/123` |
| `@Patch(':id')` | `PATCH /clientes/123` |
| `@Delete(':id')` | `DELETE /clientes/123` |

E os **decorators de parâmetro**, que extraem partes da requisição:

```ts
@Patch(':id')
update(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
  return this.service.update(id, dto)
}
```

- `@Param('id')` → pega o `:id` da URL
- `@Body()` → pega o corpo JSON da requisição (já validado pelo DTO)
- `@Query()` → pega a query string (`?page=1&ativo=true`)

> ⚠️ Note o padrão importante: **o controller não tem lógica**. Ele só recebe, valida e delega pro service (`return this.service.update(...)`). Toda regra de negócio fica no service.

---

## 4. DTOs + decorators de validação

`create-cliente.dto.ts` — um DTO é uma classe que descreve e **valida** o formato dos dados que entram:

```ts
export class CreateClienteDto {
  @IsUUID()
  barbeariaId: string

  @IsString()
  @IsNotEmpty()
  nome: string

  @IsOptional()
  @IsEmail()
  email?: string
}
```

Esses decorators vêm da lib `class-validator`. Combinados com o `ValidationPipe` do `main.ts`, eles fazem a API **rejeitar automaticamente** (HTTP 400) qualquer requisição com dados inválidos — você não precisa escrever `if (!email.includes('@'))` em lugar nenhum.

- `@IsOptional()` → campo pode faltar
- `@IsNotEmpty()` → não pode ser string vazia
- `@ApiProperty()` / `@ApiPropertyOptional()` → vêm do `@nestjs/swagger`, só documentam o campo na página `/api` (Swagger). Não validam nada.

Truque elegante no `update-cliente.dto.ts`:

```ts
export class UpdateClienteDto extends PartialType(CreateClienteDto) {}
```

`PartialType` reaproveita o `CreateClienteDto` tornando **todos os campos opcionais** — perfeito pro PATCH, sem repetir as definições.

---

## 5. Decorators de autenticação (os customizados do projeto)

Aqui está a parte mais interessante. No `app.module.ts`:

```ts
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },   // exige login em TUDO
  { provide: APP_GUARD, useClass: RolesGuard },      // checa permissões
]
```

Esses são **guards globais**: por padrão, **toda rota do app exige JWT válido**. Os decorators abaixo servem pra ajustar esse comportamento.

### `@Public()` — libera uma rota

`public.decorator.ts`:

```ts
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
```

`SetMetadata` apenas "cola uma etiqueta" no método. O `JwtAuthGuard` lê essa etiqueta e, se existir, deixa passar sem login (ex: rota de login, cadastro público).

### `@Roles(...)` — restringe por papel

`roles.decorator.ts`:

```ts
export const Roles = (...roles: RoleUsuario[]) => SetMetadata(ROLES_KEY, roles)
```

Você usaria assim: `@Roles('ADMIN')`. O `RolesGuard` lê essa etiqueta e bloqueia quem não tiver o papel.

### `@CurrentUser()` — pega o usuário logado

`current-user.decorator.ts`:

```ts
export const CurrentUser = createParamDecorator((_data, ctx): JwtPayload => {
  const request = ctx.switchToHttp().getRequest()
  return request.user
})
```

Esse é um **decorator de parâmetro customizado** (`createParamDecorator`). Depois que o `JwtAuthGuard` valida o token, ele coloca os dados do usuário em `request.user`. Esse decorator extrai isso pra você usar direto no controller:

```ts
findAll(@CurrentUser() user: JwtPayload) { ... }
```

---

## Resumo do fluxo de uma requisição

Pra `GET /clientes/123`:

1. **Guards globais** rodam → `JwtAuthGuard` valida o token (a menos que tenha `@Public()`), `RolesGuard` checa `@Roles()`.
2. **Controller** (`@Get(':id')`) captura o `123` via `@Param('id')`.
3. **ValidationPipe** valida qualquer DTO de entrada.
4. Controller chama o **Service** (`this.service.findOne(id)`).
5. **Service** executa a lógica e fala com o banco via **PrismaService**.
6. Se não achar, lança `NotFoundException` → vira HTTP 404 automaticamente.
7. O retorno vira JSON na resposta.

A regra mental: **Controller = porta de entrada (HTTP), Service = cérebro (regra de negócio), DTO = contrato de dados, Decorators = metadados que o Nest lê pra montar tudo.**
