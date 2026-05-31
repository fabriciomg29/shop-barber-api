# Shop Barber — Referência de API e Banco de Dados para o Frontend

> Este arquivo é a fonte de verdade para o frontend consultar estrutura de dados, endpoints e regras de negócio da API.  
> API base URL: `http://localhost:4870` (desenvolvimento)  
> Documentação Swagger: `http://localhost:4870/api`

---

## Autenticação

Toda rota (exceto as marcadas como públicas) exige o header:

```
Authorization: Bearer <accessToken>
```

O JWT payload contém:

```ts
{
  sub: string          // ID do usuário ou cliente
  type: 'usuario' | 'cliente'
  barbeariaId: string  // UUID da barbearia do token
  role?: 'dono' | 'barbeiro'  // apenas quando type === 'usuario'
}
```

### Rotas públicas de auth

| Método | Rota | Body | Retorno |
|--------|------|------|---------|
| POST | `/auth/login` | `{ email, senha }` | `{ accessToken, refreshToken }` |
| POST | `/auth/cliente/login` | `{ token }` | `{ accessToken, refreshToken }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| GET  | `/auth/me` | — | payload JWT |

**Login de cliente** usa o campo `token` único do modelo `Cliente` (não é senha — é o link de identificação do cliente).

---

## Paginação

Todas as rotas de listagem aceitam query params:

| Param | Tipo | Default |
|-------|------|---------|
| `page` | number | 1 |
| `limit` | number | 20 |

A resposta segue o padrão:
```json
{ "data": [...], "total": 100, "page": 1, "limit": 20 }
```

---

## Enums

```ts
enum DiaSemana       { dom, seg, ter, qua, qui, sex, sab }
enum JornadaTipo     { off, trabalha }
enum RoleUsuario     { dono, barbeiro }

enum StatusAgendamento {
  confirmado, aguardando, em_cadeira,
  concluido, bloqueado, nao_compareceu, encaixe
}

enum OrigemAgendamento { cliente_online, tablet, encaixe, recorrencia }
enum FormaPagamento    { pix, credito, debito, dinheiro }
enum StatusEncaixe     { aguardando, alocado, cancelado }
enum StatusSolicitacaoTroca { pendente, aprovada, recusada }

enum TipoProduto               { insumo, venda }
enum TipoMovimentacaoEstoque   { entrada, saida, ajuste }
enum OrigemMovimentacao        { atendimento, compra, ajuste_manual, venda_avulsa }
enum StatusPedidoFornecedor    { gerado, enviado, recebido }
enum OrigemCheckIn             { app, tablet, manual }

enum StatusNotificacao {
  fila, enviado, falha, lido
}
enum TipoNotificacao {
  confirmacao, lembrete, cancelamento,
  remarcacao, reativacao, pos_atendimento, aniversario
}
```

---

## Modelos do Banco de Dados

Todos os IDs são UUID v4. Todos os timestamps usam timezone (timestamptz).

### Barbearia

Tabela: `barbearia`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `nome` | string | |
| `endereco` | string? | |
| `cidade` | string | |
| `telefone` | string? | |
| `instagram` | string? | |
| `cancelamentoMinHoras` | int | default 2 |
| `remarcacaoMinHoras` | int | default 2 |
| `lembreteWhatsappHoras` | int | default 1 |
| `fidelidadeSelosNecessarios` | int | default 10 |
| `fidelidadeRecompensa` | string | default "Corte grátis" |
| `fidelidadeDiasInatividade` | int | default 60 |
| `metaDiaria` | decimal(10,2) | default 0 |
| `metaMensal` | decimal(10,2) | default 0 |
| `horariosFuncionamento` | JSON | `{}` — formato livre por dia da semana |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

---

### Usuario

Tabela: `usuario`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `email` | string | único |
| `senhaHash` | string? | bcrypt — nunca expor no front |
| `nome` | string | |
| `role` | RoleUsuario | `dono` ou `barbeiro` |
| `ativo` | boolean | default true |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

---

### Barbeiro

Tabela: `barbeiro`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `usuarioId` | uuid? | FK → Usuario (opcional — barbeiro pode não ter login) |
| `nome` | string | |
| `apelido` | string | nome exibido no app |
| `iniciais` | string(3) | ex: "JON" |
| `papel` | string? | ex: "Senior", "Trainee" |
| `fotoUrl` | string? | |
| `tomDePele` | string(7)? | cor hex ex: "#F4C28D" |
| `anosDeOficio` | int | default 0 |
| `comissaoPercentual` | decimal(5,2) | default 50 |
| `metaMensal` | decimal(10,2) | default 0 |
| `especialidades` | string[] | array de texto |
| `avaliacaoMedia` | decimal(3,2) | default 0 |
| `totalAvaliacoes` | int | default 0 |
| `ativo` | boolean | default true |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

**Relações carregadas junto:**
- `servicos` → lista de `BarbeiroServico` (N:N com Servico)
- `jornadas` → lista de `JornadaBarbeiro`

---

### JornadaBarbeiro

Tabela: `jornada_barbeiro` — PK composta `(barbeiroId, diaSemana)`

| Campo | Tipo | Notas |
|-------|------|-------|
| `barbeiroId` | uuid | FK → Barbeiro |
| `diaSemana` | DiaSemana | `dom`…`sab` |
| `tipo` | JornadaTipo | `off` ou `trabalha` |
| `inicio` | Time? | ex: "09:00:00" |
| `fim` | Time? | ex: "18:00:00" |

---

### Servico

Tabela: `servico`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `slug` | string | único por barbearia |
| `nome` | string | |
| `duracaoMin` | int | duração em minutos |
| `preco` | decimal(10,2) | |
| `icone` | string? | nome/código do ícone |
| `popular` | boolean | default false |
| `ativo` | boolean | default true |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

---

### Cliente

Tabela: `cliente`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `nome` | string | |
| `iniciais` | string(3)? | |
| `telefone` | string? | |
| `email` | string? | |
| `dataNascimento` | Date? | |
| `observacoes` | string? | |
| `barbeiroPreferidoId` | uuid? | FK → Barbeiro |
| `selosFidelidade` | int | default 0 |
| `recompensaPendente` | boolean | default false |
| `visitas` | int | default 0 |
| `ultimaVisita` | Date? | |
| `inativoDesde` | Date? | preenchido quando não visita há X dias |
| `token` | string | único — usado para login sem senha |
| `consentimentoLgpd` | boolean | default false |
| `consentimentoEm` | timestamptz? | |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

---

### Agendamento

Tabela: `agendamento`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `barbeiroId` | uuid | FK → Barbeiro |
| `clienteId` | uuid? | FK → Cliente (pode ser sem cadastro) |
| `servicoId` | uuid? | FK → Servico |
| `data` | Date | ex: "2025-06-10" |
| `inicio` | Time | ex: "09:00:00" |
| `fim` | Time | ex: "09:30:00" |
| `status` | StatusAgendamento | default `confirmado` |
| `precoSnapshot` | decimal(10,2)? | preço no momento do agendamento |
| `observacao` | string? | |
| `origem` | OrigemAgendamento | default `cliente_online` |
| `tokenAgendamento` | string? | único — link de acesso |
| `whatsappEnviado` | boolean | default false |
| `lembreteEnviadoEm` | timestamptz? | |
| `canceladoEm` | timestamptz? | |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

**Fluxo de status:**
`aguardando` → `confirmado` → `em_cadeira` → `concluido`  
`confirmado` / `aguardando` → `nao_compareceu` / `bloqueado`

---

### Encaixe (walk-in)

Tabela: `encaixe`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `clienteNome` | string | nome digitado na hora, sem cadastro obrigatório |
| `telefone` | string? | |
| `servicoId` | uuid | FK → Servico |
| `barbeiroPreferidoId` | uuid? | FK → Barbeiro |
| `status` | StatusEncaixe | default `aguardando` |
| `posicao` | int | posição na fila |
| `estimativaMin` | int? | minutos estimados de espera |
| `chegouEm` | timestamptz | default now() |
| `alocadoEm` | timestamptz? | quando foi chamado |
| `agendamentoId` | uuid? | agendamento gerado ao alocar |
| `createdAt` | timestamptz | |

---

### SolicitacaoTroca

Tabela: `solicitacao_troca`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `agendamentoId` | uuid | FK → Agendamento |
| `deBarbeiroId` | uuid | FK → Barbeiro |
| `paraBarbeiroId` | uuid | FK → Barbeiro |
| `motivo` | string? | |
| `status` | StatusSolicitacaoTroca | default `pendente` |
| `createdAt` | timestamptz | |
| `updatedAt` | timestamptz | |

---

### Caixa

Tabela: `caixa` — único por `(barbeariaId, data)`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `data` | Date | |
| `abertoEm` | timestamptz | |
| `fechadoEm` | timestamptz? | null = caixa aberto |
| `abertoPorId` | uuid | FK → Usuario |
| `fechadoPorId` | uuid? | FK → Usuario |
| `trocoInicial` | decimal(10,2) | |
| `totalBruto` | decimal(10,2) | |
| `totalGorjetas` | decimal(10,2) | |
| `totalAtendimentos` | int | |
| `comissoesTotal` | decimal(10,2) | |
| `totalPix` / `totalCredito` / `totalDebito` / `totalDinheiro` | decimal(10,2) | breakdown por forma de pagamento |
| `observacoesFechamento` | string? | |
| `createdAt` | timestamptz | |

---

### Atendimento

Tabela: `atendimento`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `agendamentoId` | uuid? | FK → Agendamento (opcional) |
| `caixaId` | uuid? | FK → Caixa |
| `barbeiroId` | uuid | FK → Barbeiro |
| `clienteId` | uuid | FK → Cliente |
| `valorBruto` | decimal(10,2) | |
| `gorjeta` | decimal(10,2) | default 0 |
| `formaPagamento` | FormaPagamento | |
| `comissaoCalculada` | decimal(10,2) | |
| `comissaoPaga` | boolean | default false |
| `avaliacaoNota` | int? | 1–5 |
| `avaliacaoComentario` | string? | |
| `avaliacaoEm` | timestamptz? | |
| `finalizadoEm` | timestamptz | |
| `createdAt` | timestamptz | |

**Relações:**
- `servicos` → `AtendimentoServico[]` (serviços com precoSnapshot)
- `produtos` → `AtendimentoProduto[]` (produtos usados com quantidade)

---

### Produto

Tabela: `produto`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `fornecedorId` | uuid? | FK → Fornecedor |
| `nome` | string | |
| `marca` | string? | |
| `tipo` | TipoProduto | `insumo` (consumo interno) ou `venda` |
| `consumivel` | boolean | se é descontado do estoque no atendimento |
| `estoqueAtual` | decimal(10,3) | |
| `estoqueMinimo` | decimal(10,3) | abaixo disso = alerta de reposição |
| `precoCusto` | decimal(10,2)? | |
| `precoVenda` | decimal(10,2)? | |
| `ultimaCompra` | Date? | |
| `ativo` | boolean | |
| `createdAt` / `updatedAt` | timestamptz | |

---

### Fornecedor

Tabela: `fornecedor`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `nome` | string | |
| `contato` | string? | nome do contato |
| `email` | string? | |
| `telefone` | string? | |
| `createdAt` / `updatedAt` | timestamptz | |

---

### PedidoFornecedor

Tabela: `pedido_fornecedor`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `fornecedorId` | uuid | FK → Fornecedor |
| `status` | StatusPedidoFornecedor | `gerado` → `enviado` → `recebido` |
| `criadoPorId` | uuid | FK → Usuario |
| `createdAt` / `updatedAt` | timestamptz | |

**Relação:** `itens` → `PedidoFornecedorItem[]` com `{ produtoId, quantidade, custoUnitario? }`

---

### MovimentacaoEstoque

Tabela: `movimentacao_estoque`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `produtoId` | uuid | FK → Produto |
| `tipo` | TipoMovimentacaoEstoque | `entrada`, `saida`, `ajuste` |
| `origem` | OrigemMovimentacao | |
| `quantidade` | decimal(10,3) | |
| `estoqueAntes` | decimal(10,3) | snapshot antes |
| `estoqueDepois` | decimal(10,3) | snapshot depois |
| `atendimentoId` | uuid? | se origem = atendimento |
| `pedidoId` | uuid? | se origem = compra |
| `observacao` | string? | |
| `criadoPorId` | uuid? | FK → Usuario |
| `createdAt` | timestamptz | |

---

### PontoDia

Tabela: `ponto_dia` — único por `(barbeiroId, data)`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeiroId` | uuid | FK → Barbeiro |
| `data` | Date | |
| `checkIn` | Time? | |
| `checkOut` | Time? | |
| `origemCheckIn` | OrigemCheckIn? | `app`, `tablet`, `manual` |
| `createdAt` / `updatedAt` | timestamptz | |

---

### Comunicado

Tabela: `comunicado`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `autorId` | uuid | FK → Usuario |
| `titulo` | string | |
| `corpo` | string | texto livre (pode ser Markdown) |
| `createdAt` | timestamptz | |

**Relação:** `leituras` → `ComunicadoLeitura[]` com `{ barbeiroId, lidoEm }`

---

### NotificacaoWhatsapp

Tabela: `notificacao_whatsapp`

| Campo | Tipo | Notas |
|-------|------|-------|
| `id` | uuid | PK |
| `barbeariaId` | uuid | FK → Barbearia |
| `agendamentoId` | uuid? | FK → Agendamento |
| `clienteId` | uuid? | FK → Cliente |
| `paraTelefone` | string | número destino |
| `tipo` | TipoNotificacao | |
| `template` | string | nome do template WhatsApp |
| `variaveis` | JSON | variáveis do template |
| `status` | StatusNotificacao | |
| `erroMensagem` | string? | se status = falha |
| `enviadoEm` | timestamptz? | |
| `createdAt` | timestamptz | |

---

## Endpoints Completos

### Barbearias `/barbearias`

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/barbearias` | Criar barbearia |
| GET | `/barbearias?page&limit` | Listar barbearias |
| GET | `/barbearias/:id` | Buscar por ID |
| PATCH | `/barbearias/:id` | Atualizar |
| DELETE | `/barbearias/:id` | Remover |

---

### Usuários `/usuarios`

| Método | Rota | Query | Descrição |
|--------|------|-------|-----------|
| POST | `/usuarios` | — | Criar usuário |
| GET | `/usuarios` | `barbeariaId?` | Listar |
| GET | `/usuarios/:id` | — | Buscar por ID |
| PATCH | `/usuarios/:id` | — | Atualizar |
| DELETE | `/usuarios/:id` | — | Remover |

---

### Barbeiros `/barbeiros`

| Método | Rota | Query | Descrição |
|--------|------|-------|-----------|
| POST | `/barbeiros` | — | Criar barbeiro |
| GET | `/barbeiros` | `barbeariaId?` | Listar |
| GET | `/barbeiros/:id` | — | Buscar por ID |
| PATCH | `/barbeiros/:id` | — | Atualizar |
| DELETE | `/barbeiros/:id` | — | Remover |
| GET | `/barbeiros/:id/jornada` | — | Listar jornada semanal |
| PUT | `/barbeiros/:id/jornada` | — | Substituir jornada completa |
| GET | `/barbeiros/:id/pontos` | `data?` | Listar pontos |
| POST | `/barbeiros/:id/pontos` | — | Registrar ponto |

**Body PUT jornada:** array de `{ diaSemana, tipo, inicio?, fim? }`

---

### Serviços `/servicos`

| Método | Rota | Query | Descrição |
|--------|------|-------|-----------|
| POST | `/servicos` | — | Criar serviço |
| GET | `/servicos` | `barbeariaId?` | Listar |
| GET | `/servicos/:id` | — | Buscar por ID |
| PATCH | `/servicos/:id` | — | Atualizar |
| DELETE | `/servicos/:id` | — | Remover |

---

### Clientes `/clientes`

| Método | Rota | Query | Descrição |
|--------|------|-------|-----------|
| POST | `/clientes` | — | Criar cliente |
| GET | `/clientes` | `barbeariaId?`, `ativo?` | Listar |
| GET | `/clientes/token/:token` | — | Buscar por token (login cliente) |
| GET | `/clientes/:id` | — | Buscar por ID |
| PATCH | `/clientes/:id` | — | Atualizar |
| DELETE | `/clientes/:id` | — | Remover |

---

### Agendamentos `/agendamentos`

| Método | Rota | Query | Descrição |
|--------|------|-------|-----------|
| POST | `/agendamentos` | — | Criar agendamento |
| GET | `/agendamentos` | `barbeariaId?`, `barbeiroId?`, `data?`, `status?` | Listar |
| GET | `/agendamentos/:id` | — | Buscar por ID |
| PATCH | `/agendamentos/:id` | — | Atualizar (status, etc.) |
| DELETE | `/agendamentos/:id` | — | Remover |
| POST | `/agendamentos/encaixes` | — | Criar encaixe (walk-in) |
| GET | `/agendamentos/encaixes` | `barbeariaId?`, `status?` | Listar encaixes |
| PATCH | `/agendamentos/encaixes/:id` | — | Atualizar encaixe |
| POST | `/agendamentos/trocas` | — | Solicitar troca de barbeiro |
| PATCH | `/agendamentos/trocas/:id` | — | Aprovar/recusar troca |

---

### Atendimentos `/atendimentos`

| Método | Rota | Query | Descrição |
|--------|------|-------|-----------|
| POST | `/atendimentos` | — | Registrar atendimento finalizado |
| GET | `/atendimentos` | `barbeariaId?`, `barbeiroId?`, `caixaId?` | Listar |
| GET | `/atendimentos/:id` | — | Buscar por ID |
| PATCH | `/atendimentos/:id` | — | Atualizar (avaliação, comissão) |
| POST | `/atendimentos/caixas` | — | Abrir caixa do dia |
| GET | `/atendimentos/caixas` | `barbeariaId?`, `data?` | Listar caixas |
| GET | `/atendimentos/caixas/:id` | — | Buscar caixa por ID |
| PATCH | `/atendimentos/caixas/:id` | — | Fechar/atualizar caixa |

---

### Estoque `/estoque`

| Método | Rota | Query | Descrição |
|--------|------|-------|-----------|
| POST | `/estoque/fornecedores` | — | Criar fornecedor |
| GET | `/estoque/fornecedores` | `barbeariaId?` | Listar fornecedores |
| PATCH | `/estoque/fornecedores/:id` | — | Atualizar fornecedor |
| DELETE | `/estoque/fornecedores/:id` | — | Remover fornecedor |
| POST | `/estoque/produtos` | — | Criar produto |
| GET | `/estoque/produtos` | `barbeariaId?` | Listar produtos |
| GET | `/estoque/produtos/:id` | — | Buscar produto |
| PATCH | `/estoque/produtos/:id` | — | Atualizar produto |
| DELETE | `/estoque/produtos/:id` | — | Remover produto |
| POST | `/estoque/movimentacoes` | — | Registrar movimentação |
| GET | `/estoque/movimentacoes` | `produtoId?` | Listar movimentações |
| POST | `/estoque/pedidos` | — | Criar pedido a fornecedor |
| GET | `/estoque/pedidos` | `barbeariaId?` | Listar pedidos |
| PATCH | `/estoque/pedidos/:id` | — | Atualizar status do pedido |

---

### Financeiro `/financeiro`

| Método | Rota | Query | Descrição |
|--------|------|-------|-----------|
| POST | `/financeiro/comissoes` | — | Registrar pagamento de comissão |
| GET | `/financeiro/comissoes` | `barbeariaId?`, `barbeiroId?` | Listar comissões |
| GET | `/financeiro/comissoes/:id` | — | Buscar por ID |

---

### Comunicados `/comunicados`

| Método | Rota | Query | Descrição |
|--------|------|-------|-----------|
| POST | `/comunicados` | — | Criar comunicado |
| GET | `/comunicados` | `barbeariaId?` | Listar |
| GET | `/comunicados/:id` | — | Buscar por ID |
| DELETE | `/comunicados/:id` | — | Remover |
| POST | `/comunicados/:id/leituras` | — | Marcar como lido |
| GET | `/comunicados/:id/leituras` | — | Ver quem leu |

---

### Notificações WhatsApp `/notificacoes`

| Método | Rota | Query | Descrição |
|--------|------|-------|-----------|
| POST | `/notificacoes` | — | Enfileirar notificação |
| GET | `/notificacoes` | `barbeariaId?`, `status?` | Listar |
| GET | `/notificacoes/:id` | — | Buscar por ID |
| PATCH | `/notificacoes/:id/status` | — | Atualizar status |

---

## Regras de Negócio Importantes

- **Multi-tenancy:** quase toda entidade tem `barbeariaId`. Sempre filtre por `barbeariaId` nas queries do front para não misturar dados entre barbearias.
- **Fidelidade:** `selosFidelidade` cresce a cada atendimento concluído. Quando atinge `fidelidadeSelosNecessarios`, o campo `recompensaPendente` vira `true`. O front deve exibir o alerta.
- **Clientes inativos:** `inativoDesde` é preenchido automaticamente quando o cliente ultrapassa `fidelidadeDiasInatividade` sem visita.
- **Snapshot de preços:** `precoSnapshot` em `Agendamento` e `AtendimentoServico` guarda o preço na hora do evento — use esse valor para exibir histórico, nunca o preço atual do serviço.
- **Caixa único por dia:** a constraint `UNIQUE(barbeariaId, data)` garante um caixa por barbearia por dia. Verifique se há caixa aberto antes de tentar criar um novo.
- **Comissão calculada:** `comissaoCalculada` no `Atendimento` já vem calculada pela API com base no `comissaoPercentual` do barbeiro. O front não precisa recalcular.
- **Jornada semanal:** o `PUT /barbeiros/:id/jornada` substitui toda a jornada de uma vez (não é PATCH). Envie os 7 dias sempre que alterar.
- **Encaixe → Agendamento:** ao alocar um encaixe (`status = alocado`), a API cria automaticamente um `Agendamento` vinculado via `agendamentoId`.
- **Barbeiro sem login:** `usuarioId` em `Barbeiro` é nullable. Um barbeiro pode existir sem ter acesso ao sistema.
- **Token do cliente:** o campo `token` em `Cliente` é o identificador para o app do cliente se autenticar. Não é senha — é um link único gerado pela barbearia.
