import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { StatusAgendamento } from '../../common/enums/status-agendamento.enum'
import { OrigemAgendamento } from '../../common/enums/origem-agendamento.enum'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Barbeiro } from '../../barbeiro/entities/barbeiro.entity'
import { Cliente } from '../../cliente/entities/cliente.entity'
import { Servico } from '../../servico/entities/servico.entity'
import { SolicitacaoTroca } from './solicitacao-troca.entity'
import { Encaixe } from './encaixe.entity'
import { Atendimento } from '../../atendimento/entities/atendimento.entity'
import { NotificacaoWhatsapp } from '../../notificacao/entities/notificacao-whatsapp.entity'

@Entity('agendamento')
export class Agendamento {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'date' })
  data: string

  @Column({ type: 'time' })
  inicio: string

  @Column({ type: 'time' })
  fim: string

  @Column({ type: 'enum', enum: StatusAgendamento, default: StatusAgendamento.CONFIRMADO })
  status: StatusAgendamento

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'preco_snapshot' })
  precoSnapshot: number | null

  @Column({ type: 'text', nullable: true })
  observacao: string | null

  @Column({
    type: 'enum',
    enum: OrigemAgendamento,
    default: OrigemAgendamento.CLIENTE_ONLINE,
  })
  origem: OrigemAgendamento

  @Column({ type: 'text', unique: true, nullable: true, name: 'token_agendamento' })
  tokenAgendamento: string | null

  @Column({ type: 'boolean', default: false, name: 'whatsapp_enviado' })
  whatsappEnviado: boolean

  @Column({ type: 'timestamptz', nullable: true, name: 'lembrete_enviado_em' })
  lembreteEnviadoEm: Date | null

  @Column({ type: 'timestamptz', nullable: true, name: 'cancelado_em' })
  canceladoEm: Date | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Barbearia, (b) => b.agendamentos, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Barbeiro, (b) => b.agendamentos, { nullable: false })
  @JoinColumn({ name: 'barbeiro_id' })
  barbeiro: Barbeiro

  @ManyToOne(() => Cliente, (c) => c.agendamentos, { nullable: true })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente | null

  @ManyToOne(() => Servico, (s) => s.agendamentos, { nullable: true })
  @JoinColumn({ name: 'servico_id' })
  servico: Servico | null

  @OneToMany(() => SolicitacaoTroca, (s) => s.agendamento)
  solicitacoesTroca: SolicitacaoTroca[]

  @OneToMany(() => Encaixe, (e) => e.agendamento)
  encaixes: Encaixe[]

  @OneToMany(() => Atendimento, (a) => a.agendamento)
  atendimentos: Atendimento[]

  @OneToMany(() => NotificacaoWhatsapp, (n) => n.agendamento)
  notificacoes: NotificacaoWhatsapp[]
}
