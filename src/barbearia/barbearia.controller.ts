import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { BarbeariaService } from './barbearia.service'
import { CreateBarbeariaDto } from './dto/create-barbearia.dto'
import { UpdateBarbeariaDto } from './dto/update-barbearia.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

@ApiTags('Barbearias')
@Controller('barbearias')
export class BarbeariaController {
  constructor(private readonly service: BarbeariaService) {}

  @Post()
  @ApiOperation({ summary: 'Criar barbearia' })
  create(@Body() dto: CreateBarbeariaDto) {
    return this.service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar barbearias' })
  findAll(@Query() { page = 1, limit = 20 }: PaginationDto) {
    return this.service.findAll(page, limit)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar barbearia por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar barbearia' })
  update(@Param('id') id: string, @Body() dto: UpdateBarbeariaDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover barbearia' })
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
