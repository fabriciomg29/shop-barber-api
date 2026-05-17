import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Comunicado } from './entities/comunicado.entity'
import { ComunicadoLeitura } from './entities/comunicado-leitura.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Comunicado, ComunicadoLeitura])],
  exports: [TypeOrmModule],
})
export class ComunicadoModule {}
