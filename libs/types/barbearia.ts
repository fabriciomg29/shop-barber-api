import type { DiaSemana } from './barbeiro'

export interface Barbearia {
  id: string
  nome: string
  endereco: string
  cidade: string
  telefone: string
  instagram?: string
  horariosFuncionamento: Record<DiaSemana, { abre: string; fecha: string } | null>
  regrasAgendamento: {
    cancelamentoMinHoras: number
    remarcacaoMinHoras: number
    lembreteWhatsappHoras: number
  }
  configFidelidade: {
    selosNecessarios: number
    recompensa: string
    diasParaInatividade: number
  }
  meta: {
    diaria: number
    mensal: number
  }
}
