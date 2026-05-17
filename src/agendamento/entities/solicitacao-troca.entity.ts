import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { StatusSolicitacaoTroca } from '../../common/enums/status-solicitacao-troca.enum'
import { Agendamento } from './agendamento.entity'
import { Barbeiro } from '../../barbeiro/entities/barbeiro.entity'

@Entity('solicitacao_troca')
export class SolicitacaoTroca {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', nullable: true })
  motivo: string | null

  @Column({
    type: 'enum',
    enum: StatusSolicitacaoTroca,
    default: StatusSolicitacaoTroca.PENDENTE,
  })
  status: StatusSolicitacaoTroca

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Agendamento, (a) => a.solicitacoesTroca, { nullable: false })
  @JoinColumn({ name: 'agendamento_id' })
  agendamento: Agendamento

  @ManyToOne(() => Barbeiro, (b) => b.solicitacoesDe, { nullable: false })
  @JoinColumn({ name: 'de_barbeiro_id' })
  deBarbeiro: Barbeiro

  @ManyToOne(() => Barbeiro, (b) => b.solicitacoesPara, { nullable: false })
  @JoinColumn({ name: 'para_barbeiro_id' })
  paraBarbeiro: Barbeiro
}
