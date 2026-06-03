# Funcionamento e Fluxo de Autenticação JWT

Guia explicando como a autenticação com JWT funciona no **Shop Barber API**, usando o próprio código do projeto.

## Conceitos básicos

A API usa **JWT (JSON Web Token)** com o esquema de **dois tokens**:

- **Access token** → token de curta duração (`15m`) enviado em toda requisição protegida.
- **Refresh token** → token de longa duração (`7d`) usado só para gerar um novo par de tokens quando o access expira.

Existem **dois tipos de sujeito** que podem se autenticar (`src/auth/auth.types.ts`):

```ts
export type SujeitoAuth = 'usuario' | 'cliente'

export interface JwtPayload {
  sub: string          // id do usuário ou cliente
  type: SujeitoAuth    // 'usuario' (barbeiro/admin) ou 'cliente'
  barbeariaId: string
  role?: RoleUsuario   // só existe quando type === 'usuario'
}
```

- **`usuario`** → quem trabalha na barbearia (tem `role`: `dono` ou `barbeiro`) e loga com **email + senha**.
- **`cliente`** → o cliente final, que loga com um **token** próprio (sem senha).

---

## Visão geral do fluxo

```
┌──────────┐   POST /auth/login (email+senha)        ┌─────────────┐
│ Cliente  │ ──────────────────────────────────────▶ │ AuthService │
│  HTTP    │                                          │   .login()  │
│          │ ◀──── { accessToken, refreshToken } ──── └─────────────┘
└────┬─────┘
     │
     │  GET /clientes  (Header: Authorization: Bearer <accessToken>)
     ▼
┌──────────────┐  valida token   ┌──────────────┐  checa role   ┌────────────┐
│ JwtAuthGuard │ ───────────────▶│  RolesGuard  │ ─────────────▶│ Controller │
└──────────────┘                 └──────────────┘               └────────────┘
     │ usa
     ▼
┌──────────────┐
│ JwtStrategy  │  (Passport: extrai e verifica o Bearer token)
└──────────────┘
```

---

## 1. Configuração do módulo (`auth.module.ts`)

```ts
@Module({
  imports: [PassportModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
```

- `PassportModule` → integra o Passport (lib de autenticação) ao Nest.
- `JwtModule.register({})` → registra o `JwtService` (assina/verifica tokens). Está vazio de propósito: os segredos e tempos de expiração são passados **por chamada**, no `AuthService`, lendo do `ConfigService`.
- `JwtStrategy` → a estratégia que valida o token em cada requisição.

---

## 2. Login — gerando os tokens (`auth.service.ts`)

### Login de usuário (email + senha)

```ts
async login(dto: LoginDto): Promise<TokenPair> {
  const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email } })
  if (!usuario || !usuario.ativo || !usuario.senhaHash) {
    throw new UnauthorizedException('Credenciais inválidas')
  }
  const senhaOk = await bcrypt.compare(dto.senha, usuario.senhaHash)
  if (!senhaOk) throw new UnauthorizedException('Credenciais inválidas')

  return this.issueTokens({
    sub: usuario.id,
    type: 'usuario',
    barbeariaId: usuario.barbeariaId,
    role: usuario.role,
  })
}
```

Pontos importantes:

- A senha **nunca** é guardada em texto puro — o banco tem `senhaHash`, e a comparação usa `bcrypt.compare()`.
- A mensagem de erro é genérica (`'Credenciais inválidas'`) tanto pra email inexistente quanto pra senha errada — isso evita que um atacante descubra quais emails existem.

### Login de cliente (token)

```ts
async clienteLogin(token: string): Promise<TokenPair> {
  const cliente = await this.prisma.cliente.findUnique({ where: { token } })
  if (!cliente) throw new UnauthorizedException('Token inválido')

  return this.issueTokens({
    sub: cliente.id,
    type: 'cliente',
    barbeariaId: cliente.barbeariaId,
  })
}
```

O cliente não tem senha: ele se identifica por um `token` único (gerado com `randomUUID()` quando o cliente é criado). Note que o payload **não tem `role`** — clientes não têm papel de permissão.

---

## 3. Emissão dos tokens (`issueTokens`)

```ts
private async issueTokens(payload: JwtPayload): Promise<TokenPair> {
  const accessOptions: JwtSignOptions = {
    secret: this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
    expiresIn: (this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m') as ...,
  }
  const refreshOptions: JwtSignOptions = {
    secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
    expiresIn: (this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '7d') as ...,
  }
  const [accessToken, refreshToken] = await Promise.all([
    this.jwt.signAsync(payload, accessOptions),
    this.jwt.signAsync(payload, refreshOptions),
  ])
  return { accessToken, refreshToken }
}
```

Detalhes-chave:

- O **access e o refresh usam segredos diferentes** (`JWT_ACCESS_SECRET` vs `JWT_REFRESH_SECRET`). Assim um access token roubado não serve pra renovar tokens, e vice-versa.
- Os dois são assinados **em paralelo** (`Promise.all`).
- Os valores vêm do `.env` via `ConfigService`, com fallbacks `'dev-*-secret'` só pra desenvolvimento.

> ⚠️ **Produção:** sempre defina `JWT_ACCESS_SECRET` e `JWT_REFRESH_SECRET` no `.env`. Os fallbacks `dev-*-secret` são inseguros e existem só pra facilitar o desenvolvimento local.

Variáveis de ambiente envolvidas:

| Variável | Default | Função |
|----------|---------|--------|
| `JWT_ACCESS_SECRET` | `dev-access-secret` | segredo do access token |
| `JWT_REFRESH_SECRET` | `dev-refresh-secret` | segredo do refresh token |
| `JWT_ACCESS_EXPIRES` | `15m` | validade do access token |
| `JWT_REFRESH_EXPIRES` | `7d` | validade do refresh token |

---

## 4. Renovação de tokens (`refresh`)

```ts
async refresh(refreshToken: string): Promise<TokenPair> {
  let payload: JwtPayload
  try {
    payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
      secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
    })
  } catch {
    throw new UnauthorizedException('Refresh token inválido ou expirado')
  }

  return this.issueTokens({ sub: payload.sub, type: payload.type, barbeariaId: payload.barbeariaId, role: payload.role })
}
```

Quando o access token expira (após 15 min), o front não precisa pedir login de novo: ele manda o **refresh token** em `POST /auth/refresh` e recebe um **novo par** de tokens. A verificação usa o `JWT_REFRESH_SECRET` — se o refresh estiver expirado ou adulterado, retorna 401.

---

## 5. Rotas de autenticação (`auth.controller.ts`)

```ts
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) { return this.service.login(dto) }

  @Public()
  @Post('cliente/login')
  clienteLogin(@Body() dto: ClienteLoginDto) { return this.service.clienteLogin(dto.token) }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) { return this.service.refresh(dto.refreshToken) }

  @Get('me')
  @ApiBearerAuth()
  me(@CurrentUser() user: JwtPayload) { return user }
}
```

- `login`, `cliente/login` e `refresh` têm `@Public()` → **não exigem token** (faz sentido: é por aqui que você obtém o token).
- `me` **não** é público → exige um access token válido e devolve o payload do usuário logado, extraído pelo decorator `@CurrentUser()`.

---

## 6. Como toda rota fica protegida (guards globais)

No `app.module.ts`, dois guards são registrados como **globais**:

```ts
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },   // 1º: exige token válido
  { provide: APP_GUARD, useClass: RolesGuard },      // 2º: checa permissão por role
]
```

Isso inverte a lógica: **tudo é protegido por padrão**, e você "abre" rotas específicas com `@Public()`.

### `JwtAuthGuard` — valida o token

```ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) { super() }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true            // tem @Public()? deixa passar
    return super.canActivate(context)    // senão, valida o token via JwtStrategy
  }
}
```

O `Reflector` lê a "etiqueta" que o decorator `@Public()` colou no método. Se a rota for pública, libera; senão, delega pro Passport validar o Bearer token.

### `JwtStrategy` — extrai e verifica (`strategies/jwt.strategy.ts`)

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),  // lê "Authorization: Bearer ..."
      ignoreExpiration: false,                                    // rejeita tokens expirados
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
    })
  }

  validate(payload: JwtPayload): JwtPayload {
    return payload   // o retorno vira request.user
  }
}
```

A estratégia:

1. Lê o token do header `Authorization: Bearer <token>`.
2. Verifica a assinatura com `JWT_ACCESS_SECRET` e checa a expiração.
3. Se válido, o retorno de `validate()` é colocado em **`request.user`** — é daí que o `@CurrentUser()` pega os dados.

### `RolesGuard` — checa permissões

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RoleUsuario[]>(ROLES_KEY, [...])
    if (!required || required.length === 0) return true   // rota sem @Roles? libera

    const { user } = context.switchToHttp().getRequest()
    if (!user || user.type !== 'usuario' || !user.role || !required.includes(user.role)) {
      throw new ForbiddenException('Acesso negado para o seu perfil')
    }
    return true
  }
}
```

Roda **depois** do `JwtAuthGuard` (quando `request.user` já existe). Se a rota tiver `@Roles('dono')` (papéis possíveis: `dono`, `barbeiro`), ele só deixa passar `usuario` com a role exigida — clientes e usuários sem permissão recebem **403 Forbidden**.

> Diferença importante: token inválido/ausente → **401 Unauthorized** (`JwtAuthGuard`). Token válido mas sem permissão → **403 Forbidden** (`RolesGuard`).

---

## Fluxo completo, passo a passo

### Login

1. Front envia `POST /auth/login` com `{ email, senha }`.
2. `AuthService.login()` busca o usuário, valida com `bcrypt.compare()`.
3. `issueTokens()` gera `accessToken` (15m) e `refreshToken` (7d).
4. Front guarda os dois tokens.

### Requisição protegida (ex: `GET /clientes`)

1. Front manda o header `Authorization: Bearer <accessToken>`.
2. `JwtAuthGuard` roda → rota não é `@Public()` → delega pro Passport.
3. `JwtStrategy` extrai o token, valida assinatura + expiração, popula `request.user`.
4. `RolesGuard` roda → checa `@Roles()` (se houver) contra `user.role`.
5. Passa pro controller, que executa a ação.

### Quando o access token expira

1. A API responde **401** numa requisição protegida.
2. Front envia `POST /auth/refresh` com `{ refreshToken }`.
3. `AuthService.refresh()` valida o refresh e devolve um **novo par** de tokens.
4. Front repete a requisição original com o novo access token.

A regra mental: **Login emite os tokens → o access token acompanha cada requisição → os guards validam (token + permissão) → o refresh renova sem precisar logar de novo.**
