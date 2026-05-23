import type { BarbeiroId } from './barbeiro'

export interface ComissaoBarbeiroPeriodo {
  barbeiroId: BarbeiroId
  periodoInicio: string
  periodoFim: string
  faturamentoBruto: number
  comissaoBruta: number
  jaPago: number
  saldoPendente: number
  gorjetas: number
  atendimentos: number
}
