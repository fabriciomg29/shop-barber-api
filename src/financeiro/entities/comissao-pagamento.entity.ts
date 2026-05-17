// TODO: sem updated_at — DDL não define trigger de updated_at para esta tabela
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { FormaPagamento } from '../../common/enums/forma-pagamento.enum'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Barbeiro } from '../../barbeiro/entities/barbeiro.entity'
import { Usuario } from '../../usuario/entities/usuario.entity'

@Entity('comissao_pagamento')
export class ComissaoPagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number

  @Column({ type: 'enum', enum: FormaPagamento, name: 'forma_pagamento' })
  formaPagamento: FormaPagamento

  @Column({ type: 'date', name: 'periodo_inicio' })
  periodoInicio: string

  @Column({ type: 'date', name: 'periodo_fim' })
  periodoFim: string

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => Barbearia, (b) => b.comissaoPagamentos, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Barbeiro, (b) => b.comissaoPagamentos, { nullable: false })
  @JoinColumn({ name: 'barbeiro_id' })
  barbeiro: Barbeiro

  @ManyToOne(() => Usuario, (u) => u.comissaoPagamentos, { nullable: false })
  @JoinColumn({ name: 'registrado_por' })
  registradoPor: Usuario
}
