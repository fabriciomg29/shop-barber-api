import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'
import { IsOptional, IsUUID } from 'class-validator'
import { EstoqueService } from './estoque.service'
import { CreateFornecedorDto } from './dto/create-fornecedor.dto'
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto'
import { CreateProdutoDto } from './dto/create-produto.dto'
import { UpdateProdutoDto } from './dto/update-produto.dto'
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto'
import { CreatePedidoDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

class EstoqueQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string
}

class MovimentacaoQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  produtoId?: string
}

@ApiTags('Estoque')
@Controller('estoque')
export class EstoqueController {
  constructor(private readonly service: EstoqueService) {}

  // Fornecedores
  @Post('fornecedores')
  @ApiOperation({ summary: 'Criar fornecedor' })
  createFornecedor(@Body() dto: CreateFornecedorDto) {
    return this.service.createFornecedor(dto)
  }

  @Get('fornecedores')
  @ApiOperation({ summary: 'Listar fornecedores' })
  findAllFornecedores(@Query('barbeariaId') barbeariaId?: string) {
    return this.service.findAllFornecedores(barbeariaId)
  }

  @Patch('fornecedores/:id')
  @ApiOperation({ summary: 'Atualizar fornecedor' })
  updateFornecedor(@Param('id') id: string, @Body() dto: UpdateFornecedorDto) {
    return this.service.updateFornecedor(id, dto)
  }

  @Delete('fornecedores/:id')
  @ApiOperation({ summary: 'Remover fornecedor' })
  removeFornecedor(@Param('id') id: string) {
    return this.service.removeFornecedor(id)
  }

  // Produtos
  @Post('produtos')
  @ApiOperation({ summary: 'Criar produto' })
  createProduto(@Body() dto: CreateProdutoDto) {
    return this.service.createProduto(dto)
  }

  @Get('produtos')
  @ApiOperation({ summary: 'Listar produtos' })
  findAllProdutos(@Query() query: EstoqueQueryDto) {
    return this.service.findAllProdutos(query.page ?? 1, query.limit ?? 20, query.barbeariaId)
  }

  @Get('produtos/:id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  findOneProduto(@Param('id') id: string) {
    return this.service.findOneProduto(id)
  }

  @Patch('produtos/:id')
  @ApiOperation({ summary: 'Atualizar produto' })
  updateProduto(@Param('id') id: string, @Body() dto: UpdateProdutoDto) {
    return this.service.updateProduto(id, dto)
  }

  @Delete('produtos/:id')
  @ApiOperation({ summary: 'Remover produto' })
  removeProduto(@Param('id') id: string) {
    return this.service.removeProduto(id)
  }

  // Movimentações
  @Post('movimentacoes')
  @ApiOperation({ summary: 'Registrar movimentação de estoque' })
  createMovimentacao(@Body() dto: CreateMovimentacaoDto) {
    return this.service.createMovimentacao(dto)
  }

  @Get('movimentacoes')
  @ApiOperation({ summary: 'Listar movimentações' })
  findAllMovimentacoes(@Query() query: MovimentacaoQueryDto) {
    return this.service.findAllMovimentacoes(query.page ?? 1, query.limit ?? 20, query.produtoId)
  }

  // Pedidos
  @Post('pedidos')
  @ApiOperation({ summary: 'Criar pedido a fornecedor' })
  createPedido(@Body() dto: CreatePedidoDto) {
    return this.service.createPedido(dto)
  }

  @Get('pedidos')
  @ApiOperation({ summary: 'Listar pedidos a fornecedores' })
  findAllPedidos(@Query('barbeariaId') barbeariaId?: string) {
    return this.service.findAllPedidos(barbeariaId)
  }

  @Patch('pedidos/:id')
  @ApiOperation({ summary: 'Atualizar status do pedido' })
  updatePedido(@Param('id') id: string, @Body() dto: UpdatePedidoDto) {
    return this.service.updatePedido(id, dto)
  }
}
