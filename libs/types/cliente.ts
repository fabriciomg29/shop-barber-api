import type { BarbeiroId } from './barbeiro'

export type ClienteId = string

export interface Cliente {
  id: ClienteId
  nome: string
  iniciais: string
  telefone: string
  email?: string
  visitas: number
  ultimaVisita: string
  barbeiroPreferidoId: BarbeiroId | null
  selosFidelidade: number
  inativoDesde?: string
  observacoes?: string
  criadoEm: string
  dataNascimento?: string // "MM-DD" for birthday filtering
  recompensaPendente?: boolean
}
