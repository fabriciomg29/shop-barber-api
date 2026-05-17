import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm'
import { OrigemCheckIn } from '../../common/enums/origem-check-in.enum'
import { Barbeiro } from './barbeiro.entity'

@Unique(['barbeiro', 'data'])
@Entity('ponto_dia')
export class PontoDia {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'date' })
  data: string

  @Column({ type: 'time', nullable: true, name: 'check_in' })
  checkIn: string | null

  @Column({ type: 'time', nullable: true, name: 'check_out' })
  checkOut: string | null

  @Column({ type: 'enum', enum: OrigemCheckIn, nullable: true, name: 'origem_check_in' })
  origemCheckIn: OrigemCheckIn | null

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date

  @ManyToOne(() => Barbeiro, (b) => b.pontosDia, { nullable: false })
  @JoinColumn({ name: 'barbeiro_id' })
  barbeiro: Barbeiro
}
