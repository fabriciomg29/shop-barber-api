import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'
import { StatusAgendamento, StatusEncaixe } from '@prisma/client'
import { IsDateString, IsEnum, IsOptional, IsUUID } from 'class-validator'
import { AgendamentoService } from './agendamento.service'
import { CreateAgendamentoDto } from './dto/create-agendamento.dto'
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto'
import { CreateEncaixeDto } from './dto/create-encaixe.dto'
import { UpdateEncaixeDto } from './dto/update-encaixe.dto'
import { CreateSolicitacaoTrocaDto } from './dto/create-solicitacao-troca.dto'
import { UpdateSolicitacaoTrocaDto } from './dto/update-solicitacao-troca.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

class AgendamentoQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeiroId?: string

  @ApiPropertyOptional({ example: '2025-05-17' })
  @IsOptional()
  @IsDateString()
  data?: string

  @ApiPropertyOptional({ enum: StatusAgendamento })
  @IsOptional()
  @IsEnum(StatusAgendamento)
  status?: StatusAgendamento
}

class EncaixeQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string

  @ApiPropertyOptional({ enum: StatusEncaixe })
  @IsOptional()
  @IsEnum(StatusEncaixe)
  status?: StatusEncaixe
}

@ApiTags('Agendamentos')
@Controller('agendamentos')
export class AgendamentoController {
  constructor(private readonly service: AgendamentoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar agendamento' })
  create(@Body() dto: CreateAgendamentoDto) {
    return this.service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar agendamentos' })
  findAll(@Query() query: AgendamentoQueryDto) {
    return this.service.findAll(query.page ?? 1, query.limit ?? 20, {
      barbeariaId: query.barbeariaId,
      barbeiroId: query.barbeiroId,
      data: query.data,
      status: query.status,
    })
  }

  // Sub-recursos antes de /:id para evitar conflito de rota
  @Post('encaixes')
  @ApiOperation({ summary: 'Criar encaixe (walk-in)' })
  createEncaixe(@Body() dto: CreateEncaixeDto) {
    return this.service.createEncaixe(dto)
  }

  @Get('encaixes')
  @ApiOperation({ summary: 'Listar encaixes' })
  findAllEncaixes(@Query() query: EncaixeQueryDto) {
    return this.service.findAllEncaixes(query.barbeariaId, query.status)
  }

  @Patch('encaixes/:id')
  @ApiOperation({ summary: 'Atualizar encaixe' })
  updateEncaixe(@Param('id') id: string, @Body() dto: UpdateEncaixeDto) {
    return this.service.updateEncaixe(id, dto)
  }

  @Post('trocas')
  @ApiOperation({ summary: 'Solicitar troca de barbeiro' })
  createTroca(@Body() dto: CreateSolicitacaoTrocaDto) {
    return this.service.createTroca(dto)
  }

  @Patch('trocas/:id')
  @ApiOperation({ summary: 'Aprovar ou recusar troca' })
  updateTroca(@Param('id') id: string, @Body() dto: UpdateSolicitacaoTrocaDto) {
    return this.service.updateTroca(id, dto)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  update(@Param('id') id: string, @Body() dto: UpdateAgendamentoDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover agendamento' })
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
