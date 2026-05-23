import type { FormaPagamento } from './atendimento'

export interface Caixa {
  id: string
  data: string
  abertoEm: string
  fechadoEm: string | null
  abertoPorUserId: string
  fechadoPorUserId: string | null
  troco: number
  totaisPorForma: Record<FormaPagamento, number>
  totalBruto: number
  totalGorjetas: number
  totalAtendimentos: number
  comissoesTotal: number
  observacoesFechamento?: string
}
