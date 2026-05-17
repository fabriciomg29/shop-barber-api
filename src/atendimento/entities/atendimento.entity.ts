// TODO: sem updated_at — DDL não define trigger de updated_at para esta tabela
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { FormaPagamento } from '../../common/enums/forma-pagamento.enum'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Agendamento } from '../../agendamento/entities/agendamento.entity'
import { Caixa } from './caixa.entity'
import { Barbeiro } from '../../barbeiro/entities/barbeiro.entity'
import { Cliente } from '../../cliente/entities/cliente.entity'
import { AtendimentoServico } from './atendimento-servico.entity'
import { AtendimentoProduto } from './atendimento-produto.entity'

@Entity('atendimento')
export class Atendimento {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'valor_bruto' })
  valorBruto: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  gorjeta: number

  @Column({ type: 'enum', enum: FormaPagamento, name: 'forma_pagamento' })
  formaPagamento: FormaPagamento

  @Column({ type: 'decimal', precision: 10, scale: 2, name: 'comissao_calculada' })
  comissaoCalculada: number

  @Column({ type: 'boolean', default: false, name: 'comissao_paga' })
  comissaoPaga: boolean

  @Column({ type: 'smallint', nullable: true, name: 'avaliacao_nota' })
  avaliacaoNota: number | null

  @Column({ type: 'text', nullable: true, name: 'avaliacao_comentario' })
  avaliacaoComentario: string | null

  @Column({ type: 'timestamptz', nullable: true, name: 'avaliacao_em' })
  avaliacaoEm: Date | null

  @Column({ type: 'timestamptz', default: () => 'now()', name: 'finalizado_em' })
  finalizadoEm: Date

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => Barbearia, (b) => b.atendimentos, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Agendamento, (a) => a.atendimentos, { nullable: true })
  @JoinColumn({ name: 'agendamento_id' })
  agendamento: Agendamento | null

  @ManyToOne(() => Caixa, (c) => c.atendimentos, { nullable: true })
  @JoinColumn({ name: 'caixa_id' })
  caixa: Caixa | null

  @ManyToOne(() => Barbeiro, (b) => b.atendimentos, { nullable: false })
  @JoinColumn({ name: 'barbeiro_id' })
  barbeiro: Barbeiro

  @ManyToOne(() => Cliente, (c) => c.atendimentos, { nullable: false })
  @JoinColumn({ name: 'cliente_id' })
  cliente: Cliente

  @OneToMany(() => AtendimentoServico, (a) => a.atendimento)
  servicos: AtendimentoServico[]

  @OneToMany(() => AtendimentoProduto, (a) => a.atendimento)
  produtos: AtendimentoProduto[]
}
