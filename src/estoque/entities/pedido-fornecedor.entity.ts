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
import { StatusPedidoFornecedor } from '../../common/enums/status-pedido-fornecedor.enum'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Fornecedor } from './fornecedor.entity'
import { Usuario } from '../../usuario/entities/usuario.entity'
import { PedidoFornecedorItem } from './pedido-fornecedor-item.entity'
import { MovimentacaoEstoque } from './movimentacao-estoque.entity'

@Entity('pedido_fornecedor')
export class PedidoFornecedor {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({
    type: 'enum',
    enum: StatusPedidoFornecedor,
    default: StatusPedidoFornecedor.GERADO,
  })
  status: StatusPedidoFornecedor

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Barbearia, (b) => b.pedidosFornecedor, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Fornecedor, (f) => f.pedidosFornecedor, { nullable: false })
  @JoinColumn({ name: 'fornecedor_id' })
  fornecedor: Fornecedor

  @ManyToOne(() => Usuario, (u) => u.pedidosFornecedor, { nullable: false })
  @JoinColumn({ name: 'criado_por' })
  criadoPor: Usuario

  @OneToMany(() => PedidoFornecedorItem, (p) => p.pedido)
  itens: PedidoFornecedorItem[]

  @OneToMany(() => MovimentacaoEstoque, (m) => m.pedido)
  movimentacoes: MovimentacaoEstoque[]
}
