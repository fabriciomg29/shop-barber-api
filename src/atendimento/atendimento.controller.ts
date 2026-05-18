import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsUUID } from 'class-validator'
import { AtendimentoService } from './atendimento.service'
import { CreateAtendimentoDto } from './dto/create-atendimento.dto'
import { UpdateAtendimentoDto } from './dto/update-atendimento.dto'
import { CreateCaixaDto } from './dto/create-caixa.dto'
import { UpdateCaixaDto } from './dto/update-caixa.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

class AtendimentoQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeiroId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  caixaId?: string
}

class CaixaQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string

  @ApiPropertyOptional({ example: '2025-05-17' })
  @IsOptional()
  @IsDateString()
  data?: string
}

@ApiTags('Atendimentos')
@Controller('atendimentos')
export class AtendimentoController {
  constructor(private readonly service: AtendimentoService) {}

  @Post()
  @ApiOperation({ summary: 'Registrar atendimento finalizado' })
  create(@Body() dto: CreateAtendimentoDto) {
    return this.service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar atendimentos' })
  findAll(@Query() query: AtendimentoQueryDto) {
    return this.service.findAll(query.page ?? 1, query.limit ?? 20, {
      barbeariaId: query.barbeariaId,
      barbeiroId: query.barbeiroId,
      caixaId: query.caixaId,
    })
  }

  @Post('caixas')
  @ApiOperation({ summary: 'Abrir caixa do dia' })
  createCaixa(@Body() dto: CreateCaixaDto) {
    return this.service.createCaixa(dto)
  }

  @Get('caixas')
  @ApiOperation({ summary: 'Listar caixas' })
  findAllCaixas(@Query() query: CaixaQueryDto) {
    return this.service.findAllCaixas(query.barbeariaId, query.data)
  }

  @Get('caixas/:id')
  @ApiOperation({ summary: 'Buscar caixa por ID' })
  findOneCaixa(@Param('id') id: string) {
    return this.service.findOneCaixa(id)
  }

  @Patch('caixas/:id')
  @ApiOperation({ summary: 'Fechar/atualizar caixa' })
  updateCaixa(@Param('id') id: string, @Body() dto: UpdateCaixaDto) {
    return this.service.updateCaixa(id, dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar atendimento por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar atendimento (avaliação, comissão)' })
  update(@Param('id') id: string, @Body() dto: UpdateAtendimentoDto) {
    return this.service.update(id, dto)
  }
}
