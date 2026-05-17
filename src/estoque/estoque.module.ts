import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Fornecedor } from './entities/fornecedor.entity'
import { Produto } from './entities/produto.entity'
import { ConsumoServicoProduto } from './entities/consumo-servico-produto.entity'
import { MovimentacaoEstoque } from './entities/movimentacao-estoque.entity'
import { PedidoFornecedor } from './entities/pedido-fornecedor.entity'
import { PedidoFornecedorItem } from './entities/pedido-fornecedor-item.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Fornecedor,
      Produto,
      ConsumoServicoProduto,
      MovimentacaoEstoque,
      PedidoFornecedor,
      PedidoFornecedorItem,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class EstoqueModule {}
