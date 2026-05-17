import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Agendamento } from './entities/agendamento.entity'
import { Encaixe } from './entities/encaixe.entity'
import { SolicitacaoTroca } from './entities/solicitacao-troca.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Agendamento, Encaixe, SolicitacaoTroca])],
  exports: [TypeOrmModule],
})
export class AgendamentoModule {}
