import type { ServicoId } from './barbeiro'

export type { ServicoId }

export interface Servico {
  id: ServicoId
  nome: string
  preco: number
  duracaoMin: number
  icone: string
  popular?: boolean
  ativo: boolean
}
