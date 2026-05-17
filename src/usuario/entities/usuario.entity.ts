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
import { RoleUsuario } from '../../common/enums/role-usuario.enum'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Barbeiro } from '../../barbeiro/entities/barbeiro.entity'
import { Caixa } from '../../atendimento/entities/caixa.entity'
import { ComissaoPagamento } from '../../financeiro/entities/comissao-pagamento.entity'
import { MovimentacaoEstoque } from '../../estoque/entities/movimentacao-estoque.entity'
import { PedidoFornecedor } from '../../estoque/entities/pedido-fornecedor.entity'
import { Comunicado } from '../../comunicado/entities/comunicado.entity'

@Entity('usuario')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text', unique: true })
  email: string

  @Column({ type: 'text' })
  nome: string

  @Column({ type: 'enum', enum: RoleUsuario, default: RoleUsuario.BARBEIRO })
  role: RoleUsuario

  @Column({ type: 'boolean', default: true })
  ativo: boolean

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Barbearia, (b) => b.usuarios, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @OneToMany(() => Barbeiro, (b) => b.usuario)
  barbeiros: Barbeiro[]

  @OneToMany(() => Caixa, (c) => c.abertoPor)
  caixasAbertas: Caixa[]

  @OneToMany(() => Caixa, (c) => c.fechadoPor)
  caixasFechadas: Caixa[]

  @OneToMany(() => ComissaoPagamento, (c) => c.registradoPor)
  comissaoPagamentos: ComissaoPagamento[]

  @OneToMany(() => MovimentacaoEstoque, (m) => m.criadoPor)
  movimentacoesEstoque: MovimentacaoEstoque[]

  @OneToMany(() => PedidoFornecedor, (p) => p.criadoPor)
  pedidosFornecedor: PedidoFornecedor[]

  @OneToMany(() => Comunicado, (c) => c.autor)
  comunicados: Comunicado[]
}
