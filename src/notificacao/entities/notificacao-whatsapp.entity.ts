// TODO: sem updated_at — DDL não define trigger de updated_at para esta tabela
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { TipoNotificacao } from '../../common/enums/tipo-notificacao.enum'
import { StatusNotificacao } from '../../common/enums/status-notificacao.enum'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Agendamento } from '../../agendamento/entities/agendamento.entity'
import { Cliente } from '../../cliente/entities/cliente.entity'

@Entity('notificacao_whatsapp')
export class NotificacaoWhatsapp {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', name: 'para_telefone' })
  paraTelefone: string

  @Column({ type: 'enum', enum: TipoNotificacao })
  tipo: TipoNotificacao

  @Column({ type: 'text' })
  template: string

  @Column({ type: 'jsonb', default: '{}' })
  variaveis: Record<string, string>

  @Column({ type: 'enum', enum: StatusNotificacao, default: StatusNotificacao.FILA })
  status: StatusNotificacao

  @Column({ type: 'text', nullable: true, name: 'erro_mensagem' })
  erroMensagem: string | null

  @Column({ type: 'timestamptz', nullable: true, name: 'enviado_em' })
  enviadoEm: Date | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => Barbearia, (b) => b.notificacoesWhatsapp, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Agendamento, (a) => a.notificacoes, { nullable: true })
  @JoinColumn({ name: 'agendamento_id' })
  agendamento: Agendamento | null

  @ManyToOne(() => Cliente, (c) => c.notificacoes, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente | null
}
