// TODO: sem updated_at — DDL não define trigger de updated_at para esta tabela
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Usuario } from '../../usuario/entities/usuario.entity'
import { Atendimento } from './atendimento.entity'

@Unique(['barbearia', 'data'])
@Entity('caixa')
export class Caixa {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'date' })
  data: string

  @Column({ type: 'timestamptz', default: () => 'now()', name: 'aberto_em' })
  abertoEm: Date

  @Column({ type: 'timestamptz', nullable: true, name: 'fechado_em' })
  fechadoEm: Date | null

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'troco_inicial' })
  trocoInicial: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_bruto' })
  totalBruto: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_gorjetas' })
  totalGorjetas: number

  @Column({ type: 'smallint', default: 0, name: 'total_atendimentos' })
  totalAtendimentos: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'comissoes_total' })
  comissoesTotal: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_pix' })
  totalPix: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_credito' })
  totalCredito: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_debito' })
  totalDebito: number

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0, name: 'total_dinheiro' })
  totalDinheiro: number

  @Column({ type: 'text', nullable: true, name: 'observacoes_fechamento' })
  observacoesFechamento: string | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => Barbearia, (b) => b.caixas, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Usuario, (u) => u.caixasAbertas, { nullable: false })
  @JoinColumn({ name: 'aberto_por_id' })
  abertoPor: Usuario

  @ManyToOne(() => Usuario, (u) => u.caixasFechadas, { nullable: true })
  @JoinColumn({ name: 'fechado_por_id' })
  fechadoPor: Usuario | null

  @OneToMany(() => Atendimento, (a) => a.caixa)
  atendimentos: Atendimento[]
}
