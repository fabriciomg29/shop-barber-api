import type { BarbeiroId, ServicoId } from './barbeiro'
import type { ClienteId } from './cliente'

export type AgendamentoId = string

export type StatusAtendimento =
  | 'confirmado'
  | 'em_cadeira'
  | 'aguardando'
  | 'concluido'
  | 'bloqueado'
  | 'nao_compareceu'
  | 'encaixe'

export interface Agendamento {
  id: AgendamentoId
  barbeiroId: BarbeiroId
  clienteId: ClienteId | null
  servicoId: ServicoId | null
  inicio: string
  fim: string
  data: string
  status: StatusAtendimento
  precoSnapshot: number | null
  observacao?: string
  origemAgendamento: 'cliente_online' | 'tablet' | 'encaixe' | 'recorrencia'
  whatsappEnviado: boolean
  lembreteEnviadoEm?: string
  criadoEm: string
}
