import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'
import { IsOptional, IsUUID } from 'class-validator'
import { ComunicadoService } from './comunicado.service'
import { CreateComunicadoDto } from './dto/create-comunicado.dto'
import { CreateComunicadoLeituraDto } from './dto/create-comunicado-leitura.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

class ComunicadoQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string
}

@ApiTags('Comunicados')
@Controller('comunicados')
export class ComunicadoController {
  constructor(private readonly service: ComunicadoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar comunicado' })
  create(@Body() dto: CreateComunicadoDto) {
    return this.service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar comunicados' })
  findAll(@Query() query: ComunicadoQueryDto) {
    return this.service.findAll(query.page ?? 1, query.limit ?? 20, query.barbeariaId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar comunicado por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover comunicado' })
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }

  @Post(':id/leituras')
  @ApiOperation({ summary: 'Marcar comunicado como lido' })
  marcarLido(@Param('id') id: string, @Body() dto: CreateComunicadoLeituraDto) {
    return this.service.marcarLido(id, dto)
  }

  @Get(':id/leituras')
  @ApiOperation({ summary: 'Ver quem leu o comunicado' })
  getLeituras(@Param('id') id: string) {
    return this.service.getLeituras(id)
  }
}
