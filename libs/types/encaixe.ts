import type { AgendamentoId } from './agendamento'
import type { BarbeiroId, ServicoId } from './barbeiro'

export interface Encaixe {
  id: string
  clienteNome: string
  telefone: string
  servicoId: ServicoId
  chegouEm: string
  estimativaMin: number
  posicao: number
  barbeiroPreferidoId?: BarbeiroId
  alocadoEm?: { agendamentoId: AgendamentoId; em: string }
}
