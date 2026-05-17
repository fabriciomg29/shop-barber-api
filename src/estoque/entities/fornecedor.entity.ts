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
import { Produto } from './produto.entity'
import { PedidoFornecedor } from './pedido-fornecedor.entity'

@Entity('fornecedor')
export class Fornecedor {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  nome: string

  @Column({ type: 'text', nullable: true })
  contato: string | null

  @Column({ type: 'text', nullable: true })
  email: string | null

  @Column({ type: 'text', nullable: true })
  telefone: string | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Barbearia, (b) => b.fornecedores, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @OneToMany(() => Produto, (p) => p.fornecedor)
  produtos: Produto[]

  @OneToMany(() => PedidoFornecedor, (p) => p.fornecedor)
  pedidosFornecedor: PedidoFornecedor[]
}
