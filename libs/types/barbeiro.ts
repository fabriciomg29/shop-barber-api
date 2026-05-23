export type BarbeiroId = string

export type ServicoId =
  | 'corte'
  | 'barba'
  | 'corte_barba'
  | 'degrade'
  | 'pigmentacao'
  | 'sobrancelha'
  | 'acabamento'

export type DiaSemana = 'dom' | 'seg' | 'ter' | 'qua' | 'qui' | 'sex' | 'sab'

export type JornadaDia = { tipo: 'off' } | { tipo: 'trabalha'; inicio: string; fim: string }

export interface Barbeiro {
  id: BarbeiroId
  nome: string
  apelido: string
  iniciais: string
  papel: string
  foto: string | null
  tomDePele: string
  anosDeOficio: number
  avaliacaoMedia: number
  totalAvaliacoes: number
  especialidades: string[]
  comissaoPercentual: number
  servicosExecuta: ServicoId[]
  jornada: Record<DiaSemana, JornadaDia>
  ativo: boolean
}
