import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Barbeiro } from '../../barbeiro/entities/barbeiro.entity'
import { ConsumoServicoProduto } from '../../estoque/entities/consumo-servico-produto.entity'
import { Agendamento } from '../../agendamento/entities/agendamento.entity'
import { Encaixe } from '../../agendamento/entities/encaixe.entity'
import { AtendimentoServico } from '../../atendimento/entities/atendimento-servico.entity'

@Unique(['barbearia', 'slug'])
@Entity('servico')
export class Servico {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  slug: string

  @Column({ type: 'text' })
  nome: string

  @Column({ type: 'smallint', name: 'duracao_min' })
  duracaoMin: number

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  preco: number

  @Column({ type: 'text', nullable: true })
  icone: string | null

  @Column({ type: 'boolean', default: false })
  popular: boolean

  @Column({ type: 'boolean', default: true })
  ativo: boolean

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Barbearia, (b) => b.servicos, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToMany(() => Barbeiro, (b) => b.servicos)
  barbeiros: Barbeiro[]

  @OneToMany(() => ConsumoServicoProduto, (c) => c.servico)
  consumosProdutos: ConsumoServicoProduto[]

  @OneToMany(() => Agendamento, (a) => a.servico)
  agendamentos: Agendamento[]

  @OneToMany(() => Encaixe, (e) => e.servico)
  encaixes: Encaixe[]

  @OneToMany(() => AtendimentoServico, (a) => a.servico)
  atendimentoServicos: AtendimentoServico[]
}
