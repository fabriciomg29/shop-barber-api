import { Module } from '@nestjs/common'
import { ComunicadoController } from './comunicado.controller'
import { ComunicadoService } from './comunicado.service'

@Module({
  controllers: [ComunicadoController],
  providers: [ComunicadoService],
})
export class ComunicadoModule {}
