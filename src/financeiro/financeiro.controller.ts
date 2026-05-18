import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'
import { IsOptional, IsUUID } from 'class-validator'
import { FinanceiroService } from './financeiro.service'
import { CreateComissaoPagamentoDto } from './dto/create-comissao-pagamento.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

class ComissaoQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeiroId?: string
}

@ApiTags('Financeiro')
@Controller('financeiro')
export class FinanceiroController {
  constructor(private readonly service: FinanceiroService) {}

  @Post('comissoes')
  @ApiOperation({ summary: 'Registrar pagamento de comissão' })
  create(@Body() dto: CreateComissaoPagamentoDto) {
    return this.service.createComissao(dto)
  }

  @Get('comissoes')
  @ApiOperation({ summary: 'Listar pagamentos de comissão' })
  findAll(@Query() query: ComissaoQueryDto) {
    return this.service.findAllComissoes(query.page ?? 1, query.limit ?? 20, {
      barbeariaId: query.barbeariaId,
      barbeiroId: query.barbeiroId,
    })
  }

  @Get('comissoes/:id')
  @ApiOperation({ summary: 'Buscar comissão por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOneComissao(id)
  }
}
