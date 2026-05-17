import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Usuario } from '../../usuario/entities/usuario.entity'
import { Servico } from '../../servico/entities/servico.entity'
import { JornadaBarbeiro } from './jornada-barbeiro.entity'
import { PontoDia } from './ponto-dia.entity'
import { Agendamento } from '../../agendamento/entities/agendamento.entity'
import { Encaixe } from '../../agendamento/entities/encaixe.entity'
import { SolicitacaoTroca } from '../../agendamento/entities/solicitacao-troca.entity'
import { Atendimento } from '../../atendimento/entities/atendimento.entity'
import { ComissaoPagamento } from '../../financeiro/entities/comissao-pagamento.entity'
import { ComunicadoLeitura } from '../../comunicado/entities/comunicado-leitura.entity'
import { Cliente } from '../../cliente/entities/cliente.entity'

@Entity('barbeiro')
export class Barbeiro {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  nome: string

  @Column({ type: 'text' })
  apelido: string

  @Column({ type: 'varchar', length: 3 })
  iniciais: string

  @Column({ type: 'text', nullable: true })
  papel: string | null

  @Column({ type: 'text', nullable: true, name: 'foto_url' })
  fotoUrl: string | null

  @Column({ type: 'varchar', length: 7, nullable: true, name: 'tom_de_pele' })
  tomDePele: string | null

  @Column({ type: 'smallint', default: 0, name: 'anos_de_oficio' })
  anosDeOficio: number

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 50, name: 'comissao_percentual' })
  comissaoPercentual: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'meta_mensal' })
  metaMensal: number

  @Column({ type: 'text', array: true, default: '{}' })
  especialidades: string[]

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0, name: 'avaliacao_media' })
  avaliacaoMedia: number

  @Column({ type: 'integer', default: 0, name: 'total_avaliacoes' })
  totalAvaliacoes: number

  @Column({ type: 'boolean', default: true })
  ativo: boolean

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Barbearia, (b) => b.barbeiros, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Usuario, (u) => u.barbeiros, { nullable: true })
  @JoinColumn({ name: 'usuario_id' })
  usuario: Usuario | null

  @ManyToMany(() => Servico, (s) => s.barbeiros)
  @JoinTable({
    name: 'barbeiro_servico',
    joinColumn: { name: 'barbeiro_id' },
    inverseJoinColumn: { name: 'servico_id' },
  })
  servicos: Servico[]

  @OneToMany(() => JornadaBarbeiro, (j) => j.barbeiro)
  jornadas: JornadaBarbeiro[]

  @OneToMany(() => PontoDia, (p) => p.barbeiro)
  pontosDia: PontoDia[]

  @OneToMany(() => Agendamento, (a) => a.barbeiro)
  agendamentos: Agendamento[]

  @OneToMany(() => Encaixe, (e) => e.barbeiroPreferido)
  encaixesPreferido: Encaixe[]

  @OneToMany(() => SolicitacaoTroca, (s) => s.deBarbeiro)
  solicitacoesDe: SolicitacaoTroca[]

  @OneToMany(() => SolicitacaoTroca, (s) => s.paraBarbeiro)
  solicitacoesPara: SolicitacaoTroca[]

  @OneToMany(() => Atendimento, (a) => a.barbeiro)
  atendimentos: Atendimento[]

  @OneToMany(() => ComissaoPagamento, (c) => c.barbeiro)
  comissaoPagamentos: ComissaoPagamento[]

  @OneToMany(() => ComunicadoLeitura, (c) => c.barbeiro)
  comunicadosLidos: ComunicadoLeitura[]

  @OneToMany(() => Cliente, (c) => c.barbeiroPreferido)
  clientesPreferidos: Cliente[]
}
