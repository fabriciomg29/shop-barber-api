import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Usuario } from '../../usuario/entities/usuario.entity'
import { Barbeiro } from '../../barbeiro/entities/barbeiro.entity'
import { Servico } from '../../servico/entities/servico.entity'
import { Cliente } from '../../cliente/entities/cliente.entity'
import { Agendamento } from '../../agendamento/entities/agendamento.entity'
import { Encaixe } from '../../agendamento/entities/encaixe.entity'
import { Caixa } from '../../atendimento/entities/caixa.entity'
import { Atendimento } from '../../atendimento/entities/atendimento.entity'
import { Fornecedor } from '../../estoque/entities/fornecedor.entity'
import { Produto } from '../../estoque/entities/produto.entity'
import { ComissaoPagamento } from '../../financeiro/entities/comissao-pagamento.entity'
import { PedidoFornecedor } from '../../estoque/entities/pedido-fornecedor.entity'
import { Comunicado } from '../../comunicado/entities/comunicado.entity'
import { NotificacaoWhatsapp } from '../../notificacao/entities/notificacao-whatsapp.entity'

@Entity('barbearia')
export class Barbearia {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  nome: string

  @Column({ type: 'text', nullable: true })
  endereco: string | null

  @Column({ type: 'text' })
  cidade: string

  @Column({ type: 'text', nullable: true })
  telefone: string | null

  @Column({ type: 'text', nullable: true })
  instagram: string | null

  @Column({ type: 'smallint', default: 2, name: 'cancelamento_min_horas' })
  cancelamentoMinHoras: number

  @Column({ type: 'smallint', default: 2, name: 'remarcacao_min_horas' })
  remarcacaoMinHoras: number

  @Column({ type: 'smallint', default: 1, name: 'lembrete_whatsapp_horas' })
  lembreteWhatsappHoras: number

  @Column({ type: 'smallint', default: 10, name: 'fidelidade_selos_necessarios' })
  fidelidadeSelosNecessarios: number

  @Column({ type: 'text', default: 'Corte grátis', name: 'fidelidade_recompensa' })
  fidelidadeRecompensa: string

  @Column({ type: 'smallint', default: 60, name: 'fidelidade_dias_inatividade' })
  fidelidadeDiasInatividade: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'meta_diaria' })
  metaDiaria: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'meta_mensal' })
  metaMensal: number

  @Column({ type: 'jsonb', default: '{}', name: 'horarios_funcionamento' })
  horariosFuncionamento: Record<string, { abre: string; fecha: string } | null>

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @OneToMany(() => Usuario, (u) => u.barbearia)
  usuarios: Usuario[]

  @OneToMany(() => Barbeiro, (b) => b.barbearia)
  barbeiros: Barbeiro[]

  @OneToMany(() => Servico, (s) => s.barbearia)
  servicos: Servico[]

  @OneToMany(() => Cliente, (c) => c.barbearia)
  clientes: Cliente[]

  @OneToMany(() => Agendamento, (a) => a.barbearia)
  agendamentos: Agendamento[]

  @OneToMany(() => Encaixe, (e) => e.barbearia)
  encaixes: Encaixe[]

  @OneToMany(() => Caixa, (c) => c.barbearia)
  caixas: Caixa[]

  @OneToMany(() => Atendimento, (a) => a.barbearia)
  atendimentos: Atendimento[]

  @OneToMany(() => Fornecedor, (f) => f.barbearia)
  fornecedores: Fornecedor[]

  @OneToMany(() => Produto, (p) => p.barbearia)
  produtos: Produto[]

  @OneToMany(() => ComissaoPagamento, (c) => c.barbearia)
  comissaoPagamentos: ComissaoPagamento[]

  @OneToMany(() => PedidoFornecedor, (p) => p.barbearia)
  pedidosFornecedor: PedidoFornecedor[]

  @OneToMany(() => Comunicado, (c) => c.barbearia)
  comunicados: Comunicado[]

  @OneToMany(() => NotificacaoWhatsapp, (n) => n.barbearia)
  notificacoesWhatsapp: NotificacaoWhatsapp[]
}
