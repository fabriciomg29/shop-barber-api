// TODO: sem updated_at — DDL não define trigger de updated_at para esta tabela
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm'
import { Barbearia } from '../../barbearia/entities/barbearia.entity'
import { Usuario } from '../../usuario/entities/usuario.entity'
import { ComunicadoLeitura } from './comunicado-leitura.entity'

@Entity('comunicado')
export class Comunicado {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  titulo: string

  @Column({ type: 'text' })
  corpo: string

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date

  @ManyToOne(() => Barbearia, (b) => b.comunicados, { nullable: false })
  @JoinColumn({ name: 'barbearia_id' })
  barbearia: Barbearia

  @ManyToOne(() => Usuario, (u) => u.comunicados, { nullable: false })
  @JoinColumn({ name: 'autor_id' })
  autor: Usuario

  @OneToMany(() => ComunicadoLeitura, (c) => c.comunicado)
  leituras: ComunicadoLeitura[]
}
