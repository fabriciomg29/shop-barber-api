import type { AgendamentoId } from './agendamento'

export interface NotificacaoWhatsApp {
  id: string
  agendamentoId: AgendamentoId
  para: string
  tipo: 'confirmacao' | 'lembrete' | 'cancelamento' | 'remarcacao' | 'reativacao'
  template: string
  variaveis: Record<string, string>
  enviadoEm: string | null
  status: 'fila' | 'enviado' | 'falha' | 'lido'
  erroMensagem?: string
}
