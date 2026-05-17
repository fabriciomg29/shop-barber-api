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
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Barbeiro } from '../../barbeiro/entities/barbeiro.entity'
import { Agendamento } from '../../agendamento/entities/agendamento.entity'
import { Atendimento } from '../../atendimento/entities/atendimento.entity'
import { NotificacaoWhatsapp } from '../../notificacao/entities/notificacao-whatsapp.entity'

@Entity('cliente')
export class Cliente {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  nome: string

  @Column({ type: 'varchar', length: 3, nullable: true })
  iniciais: string | null

  @Column({ type: 'text', nullable: true })
  telefone: string | null

  @Column({ type: 'text', nullable: true })
  email: string | null

  @Column({ type: 'date', nullable: true, name: 'data_nascimento' })
  dataNascimento: string | null

  @Column({ type: 'text', nullable: true })
  observacoes: string | null

  @Column({ type: 'smallint', default: 0, name: 'selos_fidelidade' })
  selosFidelidade: number

  @Column({ type: 'boolean', default: false, name: 'recompensa_pendente' })
  recompensaPendente: boolean

  @Column({ type: 'integer', default: 0 })
  visitas: number

  @Column({ type: 'date', nullable: true, name: 'ultima_visita' })
  ultimaVisita: string | null

  @Column({ type: 'date', nullable: true, name: 'inativo_desde' })
  inativoDesde: string | null

  @Column({ type: 'text', unique: true })
  token: string

  @Column({ type: 'boolean', default: false, name: 'consentimento_lgpd' })
  consentimentoLgpd: boolean

  @Column({ type: 'timestamptz', nullable: true, name: 'consentimento_em' })
  consentimentoEm: Date | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Barbearia, (b) => b.clientes, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Barbeiro, (b) => b.clientesPreferidos, { nullable: true })
  @JoinColumn({ name: 'barbeiro_preferido_id' })
  barbeiroPreferido: Barbeiro | null

  @OneToMany(() => Agendamento, (a) => a.cliente)
  agendamentos: Agendamento[]

  @OneToMany(() => Atendimento, (a) => a.cliente)
  atendimentos: Atendimento[]

  @OneToMany(() => NotificacaoWhatsapp, (n) => n.cliente)
  notificacoes: NotificacaoWhatsapp[]
}
