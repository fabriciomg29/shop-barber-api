import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { NotificacaoWhatsapp } from './entities/notificacao-whatsapp.entity'

@Module({
  imports: [TypeOrmModule.forFeature([NotificacaoWhatsapp])],
  exports: [TypeOrmModule],
})
export class NotificacaoModule {}
