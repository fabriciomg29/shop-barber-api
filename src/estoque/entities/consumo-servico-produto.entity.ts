import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Servico } from '../../servico/entities/servico.entity'
import { Produto } from './produto.entity'

@Entity('consumo_servico_produto')
export class ConsumoServicoProduto {
  @PrimaryColumn({ name: 'servico_id' })
  servicoId: string

  @PrimaryColumn({ name: 'produto_id' })
  produtoId: string

  @Column({ type: 'decimal', precision: 10, scale: 3, default: 1 })
  quantidade: number

  @ManyToOne(() => Servico, (s) => s.consumosProdutos, { nullable: false })
  @JoinColumn({ name: 'servico_id' })
  servico: Servico

  @ManyToOne(() => Produto, (p) => p.consumosServico, { nullable: false })
  @JoinColumn({ name: 'produto_id' })
  produto: Produto
}
