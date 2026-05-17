// TODO: sem updated_at — DDL não define trigger de updated_at para esta tabela
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { StatusEncaixe } from '../../common/enums/status-encaixe.enum'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Servico } from '../../servico/entities/servico.entity'
import { Barbeiro } from '../../barbeiro/entities/barbeiro.entity'
import { Agendamento } from './agendamento.entity'

@Entity('encaixe')
export class Encaixe {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', name: 'cliente_nome' })
  clienteNome: string

  @Column({ type: 'text', nullable: true })
  telefone: string | null

  @Column({ type: 'enum', enum: StatusEncaixe, default: StatusEncaixe.AGUARDANDO })
  status: StatusEncaixe

  @Column({ type: 'smallint' })
  posicao: number

  @Column({ type: 'smallint', nullable: true, name: 'estimativa_min' })
  estimativaMin: number | null

  @Column({ type: 'timestamptz', default: () => 'now()', name: 'chegou_em' })
  chegouEm: Date

  @Column({ type: 'timestamptz', nullable: true, name: 'alocado_em' })
  alocadoEm: Date | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => Barbearia, (b) => b.encaixes, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Servico, (s) => s.encaixes, { nullable: false })
  @JoinColumn({ name: 'servico_id' })
  servico: Servico

  @ManyToOne(() => Barbeiro, (b) => b.encaixesPreferido, { nullable: true })
  @JoinColumn({ name: 'barbeiro_preferido_id' })
  barbeiroPreferido: Barbeiro | null

  @ManyToOne(() => Agendamento, (a) => a.encaixes, { nullable: true })
  @JoinColumn({ name: 'agendamento_id' })
  agendamento: Agendamento | null
}
