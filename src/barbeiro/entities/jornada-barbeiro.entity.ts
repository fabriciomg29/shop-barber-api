import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { DiaSemana } from '../../common/enums/dia-semana.enum'
import { JornadaTipo } from '../../common/enums/jornada-tipo.enum'
import { Barbeiro } from './barbeiro.entity'

@Entity('jornada_barbeiro')
export class JornadaBarbeiro {
  @PrimaryColumn({ name: 'barbeiro_id' })
  barbeiroId: string

  @PrimaryColumn({ type: 'enum', enum: DiaSemana, name: 'dia_semana' })
  diaSemana: DiaSemana

  @Column({ type: 'enum', enum: JornadaTipo, default: JornadaTipo.TRABALHA })
  tipo: JornadaTipo

  @Column({ type: 'time', nullable: true })
  inicio: string | null

  @Column({ type: 'time', nullable: true })
  fim: string | null

  @ManyToOne(() => Barbeiro, (b) => b.jornadas, { nullable: false })
  @JoinColumn({ name: 'barbeiro_id' })
  barbeiro: Barbeiro
}
