import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common'
import { ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'
import { IsOptional, IsUUID } from 'class-validator'
import { ClienteService } from './cliente.service'
import { CreateClienteDto } from './dto/create-cliente.dto'
import { UpdateClienteDto } from './dto/update-cliente.dto'
import { PaginationDto } from '../common/dto/pagination.dto'

class ClienteQueryDto extends PaginationDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeariaId?: string
}

@ApiTags('Clientes')
@Controller('clientes')
export class ClienteController {
  constructor(private readonly service: ClienteService) {}

  @Post()
  @ApiOperation({ summary: 'Criar cliente' })
  create(@Body() dto: CreateClienteDto) {
    return this.service.create(dto)
  }

  @Get()
  @ApiOperation({ summary: 'Listar clientes' })
  findAll(@Query() query: ClienteQueryDto) {
    return this.service.findAll(query.page ?? 1, query.limit ?? 20, query.barbeariaId)
  }

  @Get('token/:token')
  @ApiOperation({ summary: 'Buscar cliente por token' })
  findByToken(@Param('token') token: string) {
    return this.service.findByToken(token)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cliente por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar cliente' })
  update(@Param('id') id: string, @Body() dto: UpdateClienteDto) {
    return this.service.update(id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover cliente' })
  remove(@Param('id') id: string) {
    return this.service.remove(id)
  }
}
