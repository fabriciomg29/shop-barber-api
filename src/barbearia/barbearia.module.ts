import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Barbearia } from './entities/barbearia.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Barbearia])],
  exports: [TypeOrmModule],
})
export class BarbeariaModule {}
