import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Caixa } from './entities/caixa.entity'
import { Atendimento } from './entities/atendimento.entity'
import { AtendimentoServico } from './entities/atendimento-servico.entity'
import { AtendimentoProduto } from './entities/atendimento-produto.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Caixa, Atendimento, AtendimentoServico, AtendimentoProduto]),
  ],
  exports: [TypeOrmModule],
})
export class AtendimentoModule {}
