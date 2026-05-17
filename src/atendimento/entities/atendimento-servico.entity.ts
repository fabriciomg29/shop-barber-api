import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Atendimento } from './atendimento.entity'
import { Servico } from '../../servico/entities/servico.entity'

@Entity('atendimento_servico')
export class AtendimentoServico {
  @PrimaryColumn({ name: 'atendimento_id' })
  atendimentoId: string

  @PrimaryColumn({ name: 'servico_id' })
  servicoId: string

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'preco_snapshot' })
  precoSnapshot: number

  @ManyToOne(() => Atendimento, (a) => a.servicos, { nullable: false })
  @JoinColumn({ name: 'atendimento_id' })
  atendimento: Atendimento

  @ManyToOne(() => Servico, (s) => s.atendimentoServicos, { nullable: false })
  @JoinColumn({ name: 'servico_id' })
  servico: Servico
}
