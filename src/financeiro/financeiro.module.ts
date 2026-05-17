import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ComissaoPagamento } from './entities/comissao-pagamento.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ComissaoPagamento])],
  exports: [TypeOrmModule],
})
export class FinanceiroModule {}
