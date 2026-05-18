import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBarbeiroDto } from './dto/create-barbeiro.dto'
import { UpdateBarbeiroDto } from './dto/update-barbeiro.dto'
import { SetJornadaDto } from './dto/set-jornada.dto'
import { CreatePontoDto } from './dto/create-ponto.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class BarbeiroService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBarbeiroDto) {
    return this.prisma.barbeiro.create({ data: dto })
  }

  async findAll(page: number, limit: number, barbeariaId?: string) {
    const skip = (page - 1) * limit
    const where = barbeariaId ? { barbeariaId } : {}
    const [data, total] = await Promise.all([
      this.prisma.barbeiro.findMany({ skip, take: limit, where, orderBy: { nome: 'asc' } }),
      this.prisma.barbeiro.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  async findOne(id: string) {
    const barbeiro = await this.prisma.barbeiro.findUnique({ where: { id } })
    if (!barbeiro) throw new NotFoundException(`Barbeiro ${id} não encontrado`)
    return barbeiro
  }

  async update(id: string, dto: UpdateBarbeiroDto) {
    await this.findOne(id)
    return this.prisma.barbeiro.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.barbeiro.delete({ where: { id } })
  }

  async getJornada(id: string) {
    await this.findOne(id)
    return this.prisma.jornadaBarbeiro.findMany({ where: { barbeiroId: id } })
  }

  async setJornada(id: string, dto: SetJornadaDto) {
    await this.findOne(id)
    await this.prisma.jornadaBarbeiro.deleteMany({ where: { barbeiroId: id } })
    return this.prisma.jornadaBarbeiro.createMany({
      data: dto.jornada.map((j) => ({ ...j, barbeiroId: id })),
    })
  }

  async getPontos(id: string, data?: string) {
    await this.findOne(id)
    const where: Record<string, unknown> = { barbeiroId: id }
    if (data) where.data = new Date(data)
    return this.prisma.pontoDia.findMany({ where, orderBy: { data: 'desc' } })
  }

  async createPonto(id: string, dto: CreatePontoDto) {
    await this.findOne(id)
    const data = dto.data ? new Date(dto.data) : new Date()
    return this.prisma.pontoDia.upsert({
      where: { barbeiroId_data: { barbeiroId: id, data } },
      create: { barbeiroId: id, data, ...dto },
      update: dto,
    })
  }
}
