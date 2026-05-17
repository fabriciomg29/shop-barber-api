// TODO: sem updated_at — DDL não define trigger de updated_at para esta tabela
// TODO: pedido_id FK adicionada via ALTER TABLE após criação da tabela pedido_fornecedor
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { TipoMovimentacaoEstoque } from '../../common/enums/tipo-movimentacao-estoque.enum'
import { OrigemMovimentacao } from '../../common/enums/origem-movimentacao.enum'
import { Produto } from './produto.entity'
import { Atendimento } from '../../atendimento/entities/atendimento.entity'
import { PedidoFornecedor } from './pedido-fornecedor.entity'
import { Usuario } from '../../usuario/entities/usuario.entity'

@Entity('movimentacao_estoque')
export class MovimentacaoEstoque {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'enum', enum: TipoMovimentacaoEstoque })
  tipo: TipoMovimentacaoEstoque

  @Column({ type: 'enum', enum: OrigemMovimentacao })
  origem: OrigemMovimentacao

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantidade: number

  @Column({ type: 'decimal', precision: 10, scale: 3, name: 'estoque_antes' })
  estoqueAntes: number

  @Column({ type: 'decimal', precision: 10, scale: 3, name: 'estoque_depois' })
  estoqueDepois: number

  @Column({ type: 'text', nullable: true })
  observacao: string | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => Produto, (p) => p.movimentacoes, { nullable: false })
  @JoinColumn({ name: 'produto_id' })
  produto: Produto

  @ManyToOne(() => Atendimento, { nullable: true })
  @JoinColumn({ name: 'atendimento_id' })
  atendimento: Atendimento | null

  @ManyToOne(() => PedidoFornecedor, { nullable: true })
  @JoinColumn({ name: 'pedido_id' })
  pedido: PedidoFornecedor | null

  @ManyToOne(() => Usuario, (u) => u.movimentacoesEstoque, { nullable: true })
  @JoinColumn({ name: 'criado_por' })
  criadoPor: Usuario | null
}
