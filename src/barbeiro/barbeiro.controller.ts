import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common'
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID } from 'class-validator'
import { BarbeiroService } from './barbeiro.service'
import { CreateBarbeiroDto } from './dto/create-barbeiro.dto'
import { UpdateBarbeiroDto } from './dto/update-barbeiro.dto'
import { SetJornadaDto } from './dto/set-jornada.dto'
import { CreatePontoDto } from './dto/create-ponto.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

class BarbeiroQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string
}

class PontoQueryDto {
  @ApiPropertyOptional({ example: '2025-05-17' })
  @IsOptional()
  @IsString()
  data?: string
}

@ApiTags('Barbeiros')
@Controller('barbeiros')
export class BarbeiroController {
  constructor(private readonly service: BarbeiroService) {}

  @Post()
  @ApiOperation({ summary: 'Criar barbeiro' })
  create(@Body() dto: CreateBarbeiroDto) {
    return this.service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar barbeiros' })
  findAll(@Query() query: BarbeiroQueryDto) {
    return this.service.findAll(query.page ?? 1, query.limit ?? 20, query.barbeariaId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar barbeiro por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar barbeiro' })
  update(@Param('id') id: string, @Body() dto: UpdateBarbeiroDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover barbeiro' })
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }

  @Get(':id/jornada')
  @ApiOperation({ summary: 'Listar jornada semanal do barbeiro' })
  getJornada(@Param('id') id: string) {
    return this.service.getJornada(id)
  }

  @Put(':id/jornada')
  @ApiOperation({ summary: 'Substituir jornada semanal completa' })
  setJornada(@Param('id') id: string, @Body() dto: SetJornadaDto) {
    return this.service.setJornada(id, dto)
  }

  @Get(':id/pontos')
  @ApiOperation({ summary: 'Listar pontos do barbeiro' })
  getPontos(@Param('id') id: string, @Query() query: PontoQueryDto) {
    return this.service.getPontos(id, query.data)
  }

  @Post(':id/pontos')
  @ApiOperation({ summary: 'Registrar ponto do barbeiro' })
  createPonto(@Param('id') id: string, @Body() dto: CreatePontoDto) {
    return this.service.createPonto(id, dto)
  }
}
