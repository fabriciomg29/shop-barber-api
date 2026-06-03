# Regras de Negócio — Shop Barber API

Documento de referência das regras de negócio **implementadas hoje** na API. Consulte aqui quando tiver dúvida sobre como o sistema se comporta.

> **Como ler este documento.** Cada área separa três coisas:
> - ✅ **Aplicado em código** — regra que o `service` realmente executa/valida.
> - 🗄️ **Garantido pelo banco** — regra embutida no schema Prisma (default, unicidade, cascata). Vale mesmo sem código extra.
> - ⚠️ **Previsto, mas não automatizado** — o modelo tem o campo/estrutura para a regra, mas **nenhum código a calcula ou valida ainda**. Hoje depende de quem chama a API mandar o valor certo.
>
> Última atualização baseada no código em `2026-05-31`.

---

## Conceitos centrais

- **Multi-tenant por barbearia.** Quase toda entidade tem `barbeariaId`. Os filtros de listagem aceitam `barbeariaId`, mas **a API não força isolamento automático** por barbearia no token — veja [Pontos de atenção](#pontos-de-atenção-gerais).
- **IDs** são UUID gerados pelo banco (`gen_random_uuid()`).
- **Soft references:** ao apagar uma barbearia, tudo em cascata é removido (`onDelete: Cascade`). Já barbeiro preferido, fornecedor de produto, etc. viram `null` (`onDelete: SetNull`).
- **Snapshots de preço:** agendamentos e atendimentos guardam o preço no momento (`precoSnapshot`), para não mudarem se o serviço/produto for reprecificado depois.

---

## 1. Barbearia (configurações que governam regras)

A barbearia guarda os **parâmetros de negócio** que outras regras deveriam usar. Hoje são apenas valores armazenados (🗄️), consultáveis, mas **ainda não aplicados automaticamente** (⚠️):

| Campo | Default | Significado |
|-------|---------|-------------|
| `cancelamentoMinHoras` | `2` | mínimo de horas antes do horário para cancelar |
| `remarcacaoMinHoras` | `2` | mínimo de horas antes para remarcar |
| `lembreteWhatsappHoras` | `1` | quantas horas antes disparar lembrete |
| `fidelidadeSelosNecessarios` | `10` | selos para ganhar recompensa |
| `fidelidadeRecompensa` | `"Corte grátis"` | descrição da recompensa |
| `fidelidadeDiasInatividade` | `60` | dias sem visita para marcar cliente como inativo |
| `metaDiaria` / `metaMensal` | `0` | metas financeiras |
| `horariosFuncionamento` | `{}` | JSON livre com horários |

⚠️ **Importante:** essas janelas (cancelamento, remarcação, lembrete, fidelidade, inatividade) **não são validadas em nenhum service hoje**. São configuração pura. Quem implementar essas validações precisa lê-las daqui.

---

## 2. Usuários e papéis (RBAC)

✅ **Aplicado em código** (ver `docs/autenticacao-jwt.md`):

- Dois tipos de sujeito autenticável: **`usuario`** (equipe) e **`cliente`**.
- Papéis de usuário (`RoleUsuario`): **`dono`** e **`barbeiro`**. (Não existe "admin" — o papel máximo é `dono`.)
- Usuário loga com **email + senha** (hash bcrypt); cliente loga com **token único**.
- O `RolesGuard` só libera rotas marcadas com `@Roles(...)` para `type === 'usuario'` com a role exigida. Cliente nunca passa em rota com `@Roles`.

🗄️ **Garantido pelo banco:**

- `email` do usuário é **único**.
- `role` default = `barbeiro`; `ativo` default = `true`.
- Login bloqueia usuário com `ativo = false` ou sem `senhaHash`.

⚠️ **Atenção:** o CRUD de usuário (`UsuarioService.create`) grava o que vier no DTO — **não há hash de senha no cadastro de usuário** aqui (o `login` espera `senhaHash` já existente, populado via seed/processo externo). Confirme isso antes de assumir que `POST /usuarios` cria login funcional.

---

## 3. Barbeiros, jornada e ponto

✅ **Aplicado em código** (`BarbeiroService`):

- **Jornada (`setJornada`)** é tratada como substituição total: ao salvar, **apaga todas as jornadas do barbeiro e recria** as enviadas. Não é merge — o que você manda vira a jornada completa.
- **Ponto do dia (`createPonto`)** usa **upsert por `(barbeiroId, data)`**: registrar ponto no mesmo dia **atualiza** o registro existente em vez de duplicar. Se `data` não vier, usa o dia atual.
- Toda operação de jornada/ponto valida antes que o barbeiro existe (`findOne`), senão 404.

🗄️ **Garantido pelo banco:**

- Jornada tem PK composta `(barbeiroId, diaSemana)` → no máximo **uma entrada por dia da semana**.
- `JornadaTipo`: `trabalha` (default) ou `off`.
- Ponto tem unicidade `(barbeiroId, data)` → **um ponto por barbeiro por dia**.
- `comissaoPercentual` default = **50%**; `iniciais` limitado a 3 caracteres; `ativo` default `true`.

---

## 4. Serviços

✅/🗄️:

- `slug` é **único por barbearia** (`@@unique([barbeariaId, slug])`) — duas barbearias podem ter o mesmo slug, a mesma não.
- `ativo` default `true`, `popular` default `false`.
- CRUD simples; `remove` valida existência antes (404 se não achar).

⚠️ Não há regra impedindo apagar serviço usado em agendamentos futuros (a FK de agendamento→serviço não é cascade; é uma referência simples).

---

## 5. Clientes, fidelidade e LGPD

✅ **Aplicado em código** (`ClienteService`):

- Ao criar cliente, é gerado automaticamente um **`token` único** (`randomUUID()`) — é com ele que o cliente faz login.
- **Filtro de ativos/inativos** em `findAll`: `ativo=true` → clientes com `inativoDesde = null`; `ativo=false` → com `inativoDesde` preenchido. Mas atenção: esse filtro **só é aplicado quando `barbeariaId` NÃO é informado** (o código usa `else if`). Passando `barbeariaId`, o filtro `ativo` é ignorado.

🗄️ **Garantido pelo banco:**

- `token` é único e indexado.
- Defaults: `selosFidelidade = 0`, `recompensaPendente = false`, `visitas = 0`, `consentimentoLgpd = false`.

⚠️ **Previsto, mas NÃO automatizado** (campos existem, nada os move sozinho):

- **Fidelidade:** `selosFidelidade`, `recompensaPendente` — nada incrementa selos ao concluir atendimento. É manual/externo hoje.
- **Visitas / última visita / inatividade:** `visitas`, `ultimaVisita`, `inativoDesde` não são atualizados por nenhum fluxo de atendimento.
- **Consentimento LGPD:** `consentimentoEm` não é preenchido automaticamente quando `consentimentoLgpd` vira `true`.

---

## 6. Agendamentos

✅ **Aplicado em código** (`AgendamentoService`): apenas **CRUD direto**. Cria, lista (filtros: `barbeariaId`, `barbeiroId`, `data`, `status`), atualiza e remove. Validação de existência no update/remove.

🗄️ **Garantido pelo banco:**

- `status` default = `confirmado`. Estados possíveis (`StatusAgendamento`): `confirmado`, `aguardando`, `em_cadeira`, `concluido`, `bloqueado`, `nao_compareceu`, `encaixe`.
- `origem` default = `cliente_online`. Origens: `cliente_online`, `tablet`, `encaixe`, `recorrencia`.
- `tokenAgendamento` é único (quando preenchido).
- Guarda `data`, `inicio`, `fim` separados; `precoSnapshot` para travar o preço.

⚠️ **Previsto, mas NÃO automatizado / NÃO validado:**

- **Não há verificação de conflito de horário** — a API aceita dois agendamentos sobrepostos para o mesmo barbeiro. (Existe índice `(barbeiroId, data)`, mas é só performance, não constraint de unicidade.)
- **Janelas de cancelamento/remarcação** (`cancelamentoMinHoras`/`remarcacaoMinHoras` da barbearia) **não são checadas**.
- `canceladoEm`, `whatsappEnviado`, `lembreteEnviadoEm` são campos manuais — nada os preenche por transição de status.
- Não há máquina de estados: qualquer `status` pode ir para qualquer outro via `update`.

---

## 7. Encaixes (fila de espera)

✅ **Aplicado em código:**

- Lista de encaixes é ordenada por **`posicao` ascendente** (a fila).
- Filtros por `barbeariaId` e `status`.
- CRUD com validação de existência no update.

🗄️ **Garantido pelo banco:**

- `status` (`StatusEncaixe`): `aguardando` (default), `alocado`, `cancelado`.
- `chegouEm` default = agora.
- `posicao` é obrigatória.

⚠️ Não há lógica que **recalcule posições** da fila nem que ligue o encaixe a um `agendamento` automaticamente ao alocar (`alocadoEm`/`agendamentoId` são preenchidos manualmente via update).

---

## 8. Solicitações de troca (entre barbeiros)

✅ CRUD simples (`createTroca`/`updateTroca`), com validação de existência no update.

🗄️ `status` (`StatusSolicitacaoTroca`): `pendente` (default), `aprovada`, `recusada`.

⚠️ Aprovar uma troca **não** reatribui o barbeiro do agendamento automaticamente — apenas muda o status da solicitação. A reatribuição (se desejada) é manual.

---

## 9. Atendimentos (a venda/comanda)

✅ **Aplicado em código** (`AtendimentoService`):

- `create` aceita o atendimento com **serviços e produtos aninhados** (`createMany`), gravados de uma vez e retornados com `include`.
- Lista ordenada por `finalizadoEm desc`, filtros por `barbeariaId`, `barbeiroId`, `caixaId`.

🗄️ **Garantido pelo banco:**

- `gorjeta` default `0`, `comissaoPaga` default `false`.
- `formaPagamento` (`FormaPagamento`): `pix`, `credito`, `debito`, `dinheiro`.
- Itens guardam `precoSnapshot` (serviços/produtos) para preservar o valor cobrado.
- `finalizadoEm` default = agora.

⚠️ **Previsto, mas NÃO automatizado** — pontos críticos:

- **`comissaoCalculada` NÃO é calculada pela API.** O valor vem no DTO. Apesar de o barbeiro ter `comissaoPercentual`, nenhum código multiplica valor × percentual aqui.
- **`valorBruto` não é somado dos serviços/produtos** — é informado direto.
- **Estoque NÃO baixa automaticamente** ao registrar produtos consumidos num atendimento (ver Estoque).
- **Totais do caixa não são atualizados** quando um atendimento é vinculado a ele.
- **Fidelidade/visitas do cliente não mudam** ao concluir atendimento.
- Avaliação (`avaliacaoNota`, `avaliacaoMedia` do barbeiro) não propaga para a média do barbeiro automaticamente.

---

## 10. Caixa

✅ **Aplicado em código** (`AtendimentoService.*Caixa`):

- **Regra de fechamento:** ao atualizar o caixa, **se vier `fechadoPorId`, o sistema seta `fechadoEm = agora` automaticamente.** Esse é o único cálculo automático do caixa.
- Lista ordenada por `data desc`, filtro por `barbeariaId` e `data`.

🗄️ **Garantido pelo banco:**

- **Um caixa por barbearia por dia** (`@@unique([barbeariaId, data])`).
- `abertoEm` default = agora; vários totais com default `0`.

⚠️ **Previsto, mas NÃO automatizado:** todos os totais (`totalBruto`, `totalPix`, `comissoesTotal`, `totalAtendimentos`, etc.) **não são somados pela API**. Hoje vêm prontos no update — não há agregação dos atendimentos do caixa.

---

## 11. Estoque (produtos, movimentações, pedidos)

✅ **Aplicado em código** (`EstoqueService`):

- CRUD de fornecedores e produtos com validação de existência.
- **Pedido a fornecedor (`createPedido`)** grava os itens aninhados de uma vez.
- Movimentações são listadas por `createdAt desc`, filtráveis por `produtoId`.

🗄️ **Garantido pelo banco:**

- `Produto`: `tipo` (`insumo`/`venda`, default `insumo`), `consumivel` default `false`, `estoqueAtual`/`estoqueMinimo` default `0`.
- `MovimentacaoEstoque`: tipos `entrada`/`saida`/`ajuste`; origens `atendimento`/`compra`/`ajuste_manual`/`venda_avulsa`. Guarda `estoqueAntes` e `estoqueDepois`.
- `PedidoFornecedor.status`: `gerado` (default), `enviado`, `recebido`.

⚠️ **Previsto, mas NÃO automatizado** — muito importante:

- **`createMovimentacao` NÃO altera `produto.estoqueAtual`.** Ela apenas insere o registro de movimentação com os valores `estoqueAntes`/`estoqueDepois` **que vierem no DTO**. A baixa/entrada real do estoque é responsabilidade de quem chama.
- **Receber um pedido (`status = recebido`) não dá entrada no estoque** automaticamente.
- **`estoqueMinimo` não dispara alerta nem pedido** automático.
- Consumo serviço→produto (`ConsumoServicoProduto`) existe no modelo, mas **não desconta estoque** ao realizar o serviço.

---

## 12. Financeiro (comissões)

✅ `FinanceiroService`: registra um **pagamento de comissão** (`ComissaoPagamento`) referente a um período (`periodoInicio`/`periodoFim`) e lista/consulta. CRUD parcial (sem update/delete).

⚠️ **Previsto, mas NÃO automatizado:** o **valor da comissão é informado**, não calculado a partir dos atendimentos do período. Marcar a comissão como paga **não** atualiza `comissaoPaga` nos atendimentos correspondentes. São fluxos manuais hoje.

---

## 13. Comunicados (mural interno)

✅ **Aplicado em código** (`ComunicadoService`):

- `marcarLido` usa **upsert por `(comunicadoId, barbeiroId)`**: marcar como lido duas vezes não duplica — apenas atualiza `lidoEm`.
- `findOne` retorna o comunicado **com as leituras** incluídas.

🗄️ Leitura tem PK `(comunicadoId, barbeiroId)` → **uma leitura por barbeiro por comunicado**. `lidoEm` default = agora.

---

## 14. Notificações WhatsApp

✅ **Aplicado em código** (`NotificacaoService`):

- **Regra de status:** ao atualizar o status para **`enviado`**, o sistema seta `enviadoEm = agora` automaticamente. Se vier `erroMensagem`, é gravada.
- `variaveis` default `{}` quando não informado.

🗄️ **Garantido pelo banco:**

- `status` (`StatusNotificacao`): `fila` (default), `enviado`, `falha`, `lido`.
- `tipo` (`TipoNotificacao`): `confirmacao`, `lembrete`, `cancelamento`, `remarcacao`, `reativacao`, `pos_atendimento`, `aniversario`.

⚠️ **Previsto, mas NÃO automatizado:** a API **não envia** WhatsApp nem enfileira nada sozinha — ela só registra a notificação e seu status. O disparo real (e a criação de lembretes/aniversário/pós-atendimento) é externo. Nenhum evento de agendamento cria notificação automaticamente.

---

## Pontos de atenção gerais

Resumo do que **não existe ainda** e costuma gerar dúvida:

1. **Sem isolamento automático por barbearia.** O token tem `barbeariaId`, mas os services não filtram por ele — quem passar outro `barbeariaId` na query enxerga dados de outra barbearia. O escopo depende do filtro enviado, não do usuário logado.
2. **Sem cálculos financeiros automáticos.** Comissão, valor bruto e totais de caixa são todos informados, nunca computados.
3. **Sem movimentação automática de estoque.** Toda alteração de saldo é manual.
4. **Sem validação de conflito de agenda** nem janelas de cancelamento/remarcação.
5. **Sem automação de fidelidade/inatividade** de clientes.
6. **Sem máquina de estados** — qualquer status pode mudar para qualquer outro via update.
7. **Notificações não são enviadas** pela API; só registradas.

> Em resumo: a API hoje é majoritariamente **CRUD + algumas automações pontuais de timestamp** (`fechadoEm` no caixa, `enviadoEm` na notificação, upserts de ponto/leitura, token de cliente). As regras de negócio "ricas" (comissão, estoque, fidelidade, agenda) **estão modeladas no banco mas a lógica ainda não foi implementada** — o cálculo é responsabilidade de quem consome a API.
