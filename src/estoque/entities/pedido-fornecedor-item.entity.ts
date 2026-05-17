import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { PedidoFornecedor } from './pedido-fornecedor.entity'
import { Produto } from './produto.entity'

@Entity('pedido_fornecedor_item')
export class PedidoFornecedorItem {
  @PrimaryColumn({ name: 'pedido_id' })
  pedidoId: string

  @PrimaryColumn({ name: 'produto_id' })
  produtoId: string

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantidade: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'custo_unitario' })
  custoUnitario: number | null

  @ManyToOne(() => PedidoFornecedor, (p) => p.itens, { nullable: false })
  @JoinColumn({ name: 'pedido_id' })
  pedido: PedidoFornecedor

  @ManyToOne(() => Produto, (p) => p.pedidosItens, { nullable: false })
  @JoinColumn({ name: 'produto_id' })
  produto: Produto
}
