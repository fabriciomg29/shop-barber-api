import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Atendimento } from './atendimento.entity'
import { Produto } from '../../estoque/entities/produto.entity'

@Entity('atendimento_produto')
export class AtendimentoProduto {
  @PrimaryColumn({ name: 'atendimento_id' })
  atendimentoId: string

  @PrimaryColumn({ name: 'produto_id' })
  produtoId: string

  @Column({ type: 'decimal', precision: 10, scale: 3 })
  quantidade: number

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'preco_snapshot' })
  precoSnapshot: number | null

  @ManyToOne(() => Atendimento, (a) => a.produtos, { nullable: false })
  @JoinColumn({ name: 'atendimento_id' })
  atendimento: Atendimento

  @ManyToOne(() => Produto, (p) => p.atendimentoProdutos, { nullable: false })
  @JoinColumn({ name: 'produto_id' })
  produto: Produto
}
