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
import { TipoProduto } from '../../common/enums/tipo-produto.enum'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Fornecedor } from './fornecedor.entity'
import { ConsumoServicoProduto } from './consumo-servico-produto.entity'
import { MovimentacaoEstoque } from './movimentacao-estoque.entity'
import { PedidoFornecedorItem } from './pedido-fornecedor-item.entity'
import { AtendimentoProduto } from '../../atendimento/entities/atendimento-produto.entity'

@Entity('produto')
export class Produto {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  nome: string

  @Column({ type: 'text', nullable: true })
  marca: string | null

  @Column({ type: 'enum', enum: TipoProduto, default: TipoProduto.INSUMO })
  tipo: TipoProduto

  @Column({ type: 'boolean', default: false })
  consumivel: boolean

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, name: 'estoque_atual' })
  estoqueAtual: number

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 0, name: 'estoque_minimo' })
  estoqueMinimo: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'preco_custo' })
  precoCusto: number | null

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'preco_venda' })
  precoVenda: number | null

  @Column({ type: 'date', nullable: true, name: 'ultima_compra' })
  ultimaCompra: string | null

  @Column({ type: 'boolean', default: true })
  ativo: boolean

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Barbearia, (b) => b.produtos, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Fornecedor, (f) => f.produtos, { nullable: true })
  @JoinColumn({ name: 'fornecedor_id' })
  fornecedor: Fornecedor | null

  @OneToMany(() => ConsumoServicoProduto, (c) => c.produto)
  consumosServico: ConsumoServicoProduto[]

  @OneToMany(() => MovimentacaoEstoque, (m) => m.produto)
  movimentacoes: MovimentacaoEstoque[]

  @OneToMany(() => PedidoFornecedorItem, (p) => p.produto)
  pedidosItens: PedidoFornecedorItem[]

  @OneToMany(() => AtendimentoProduto, (a) => a.produto)
  atendimentoProdutos: AtendimentoProduto[]
}
