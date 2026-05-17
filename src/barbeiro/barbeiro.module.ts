import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Barbeiro } from './entities/barbeiro.entity'
import { JornadaBarbeiro } from './entities/jornada-barbeiro.entity'
import { PontoDia } from './entities/ponto-dia.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Barbeiro, JornadaBarbeiro, PontoDia])],
  exports: [TypeOrmModule],
})
export class BarbeiroModule {}
