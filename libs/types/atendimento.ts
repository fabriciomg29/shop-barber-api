import type { AgendamentoId } from './agendamento'
import type { BarbeiroId, ServicoId } from './barbeiro'
import type { ClienteId } from './cliente'

export type FormaPagamento = 'pix' | 'credito' | 'debito' | 'dinheiro'

export interface AtendimentoHistorico {
  data: string
  servico: string
  barbeiro: string
  valor: number
  avaliacao?: { nota: number; comentario?: string }
}

export interface Atendimento {
  id: string
  agendamentoId: AgendamentoId
  barbeiroId: BarbeiroId
  clienteId: ClienteId
  servicos: ServicoId[]
  produtosConsumidos: { produtoId: string; qtd: number }[]
  valorBruto: number
  gorjeta: number
  formaPagamento: FormaPagamento
  comissaoCalculada: number
  avaliacao?: { nota: 1 | 2 | 3 | 4 | 5; comentario?: string }
  finalizadoEm: string
}
