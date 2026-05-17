import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm'
import { Barbeiro } from '../../barbeiro/entities/barbeiro.entity'
import { Comunicado } from './comunicado.entity'

@Entity('comunicado_leitura')
export class ComunicadoLeitura {
  @PrimaryColumn({ name: 'comunicado_id' })
  comunicadoId: string

  @PrimaryColumn({ name: 'barbeiro_id' })
  barbeiroId: string

  @Column({ type: 'timestamptz', default: () => 'now()', name: 'lido_em' })
  lidoEm: Date

  @ManyToOne(() => Comunicado, (c) => c.leituras, { nullable: false })
  @JoinColumn({ name: 'comunicado_id' })
  comunicado: Comunicado

  @ManyToOne(() => Barbeiro, (b) => b.comunicadosLidos, { nullable: false })
  @JoinColumn({ name: 'barbeiro_id' })
  barbeiro: Barbeiro
}
