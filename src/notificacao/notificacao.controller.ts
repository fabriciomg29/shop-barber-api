import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'
import { StatusNotificacao } from '@prisma/client'
import { IsEnum, IsOptional, IsUUID } from 'class-validator'
import { NotificacaoService } from './notificacao.service'
import { CreateNotificacaoDto } from './dto/create-notificacao.dto'
import { UpdateNotificacaoStatusDto } from './dto/update-notificacao-status.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

class NotificacaoQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string

  @ApiPropertyOptional({ enum: StatusNotificacao })
  @IsOptional()
  @IsEnum(StatusNotificacao)
  status?: StatusNotificacao
}

@ApiTags('Notificacoes')
@Controller('notificacoes')
export class NotificacaoController {
  constructor(private readonly service: NotificacaoService) {}

  @Post()
  @ApiOperation({ summary: 'Enfileirar notificação WhatsApp' })
  create(@Body() dto: CreateNotificacaoDto) {
    return this.service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar notificações' })
  findAll(@Query() query: NotificacaoQueryDto) {
    return this.service.findAll(query.page ?? 1, query.limit ?? 20, {
      barbeariaId: query.barbeariaId,
      status: query.status,
    })
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar notificação por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar status da notificação' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateNotificacaoStatusDto) {
    return this.service.updateStatus(id, dto)
  }
}
