import { Injectable, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClienteDto } from './dto/create-cliente.dto'
import { UpdateClienteDto } from './dto/update-cliente.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class ClienteService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateClienteDto) {
    return this.prisma.cliente.create({
      data: { ...dto, token: randomUUID() },
    })
  }

  async findAll(page: number, limit: number, barbeariaId?: string) {
    const skip = (page - 1) * limit
    const where = barbeariaId ? { barbeariaId } : {}
    const [data, total] = await Promise.all([
      this.prisma.cliente.findMany({ skip, take: limit, where, orderBy: { nome: 'asc' } }),
      this.prisma.cliente.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  async findOne(id: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { id } })
    if (!cliente) throw new NotFoundException(`Cliente ${id} não encontrado`)
    return cliente
  }

  async findByToken(token: string) {
    const cliente = await this.prisma.cliente.findUnique({ where: { token } })
    if (!cliente) throw new NotFoundException(`Cliente com token ${token} não encontrado`)
    return cliente
  }

  async update(id: string, dto: UpdateClienteDto) {
    await this.findOne(id)
    return this.prisma.cliente.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.cliente.delete({ where: { id } })
  }
}
