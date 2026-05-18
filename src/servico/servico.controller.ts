import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'
import { IsOptional, IsUUID } from 'class-validator'
import { ServicoService } from './servico.service'
import { CreateServicoDto } from './dto/create-servico.dto'
import { UpdateServicoDto } from './dto/update-servico.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

class ServicoQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string
}

@ApiTags('Servicos')
@Controller('servicos')
export class ServicoController {
  constructor(private readonly service: ServicoService) {}

  @Post()
  @ApiOperation({ summary: 'Criar serviço' })
  create(@Body() dto: CreateServicoDto) {
    return this.service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar serviços' })
  findAll(@Query() query: ServicoQueryDto) {
    return this.service.findAll(query.page ?? 1, query.limit ?? 20, query.barbeariaId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar serviço por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar serviço' })
  update(@Param('id') id: string, @Body() dto: UpdateServicoDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover serviço' })
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
