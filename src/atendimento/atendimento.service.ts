import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAtendimentoDto } from './dto/create-atendimento.dto'
import { UpdateAtendimentoDto } from './dto/update-atendimento.dto'
import { CreateCaixaDto } from './dto/create-caixa.dto'
import { UpdateCaixaDto } from './dto/update-caixa.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class AtendimentoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAtendimentoDto) {
    const { servicos, produtos, ...rest } = dto
    return this.prisma.atendimento.create({
      data: {
        ...rest,
        servicos: servicos ? { createMany: { data: servicos } } : undefined,
        produtos: produtos ? { createMany: { data: produtos } } : undefined,
      },
      include: { servicos: true, produtos: true },
    })
  }

  async findAll(
    page: number,
    limit: number,
    filters: { barbeariaId?: string; barbeiroId?: string; caixaId?: string },
  ) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}
    if (filters.barbeariaId) where.barbeariaId = filters.barbeariaId
    if (filters.barbeiroId) where.barbeiroId = filters.barbeiroId
    if (filters.caixaId) where.caixaId = filters.caixaId
    const [data, total] = await Promise.all([
      this.prisma.atendimento.findMany({
        skip,
        take: limit,
        where,
        include: { servicos: true, produtos: true },
        orderBy: { finalizadoEm: 'desc' },
      }),
      this.prisma.atendimento.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  async findOne(id: string) {
    const atendimento = await this.prisma.atendimento.findUnique({
      where: { id },
      include: { servicos: true, produtos: true },
    })
    if (!atendimento) throw new NotFoundException(`Atendimento ${id} não encontrado`)
    return atendimento
  }

  async update(id: string, dto: UpdateAtendimentoDto) {
    await this.findOne(id)
    return this.prisma.atendimento.update({ where: { id }, data: dto })
  }

  // Caixa
  async createCaixa(dto: CreateCaixaDto) {
    return this.prisma.caixa.create({ data: dto })
  }

  async findAllCaixas(barbeariaId?: string, data?: string) {
    const where: Record<string, unknown> = {}
    if (barbeariaId) where.barbeariaId = barbeariaId
    if (data) where.data = new Date(data)
    return this.prisma.caixa.findMany({ where, orderBy: { data: 'desc' } })
  }

  async findOneCaixa(id: string) {
    const caixa = await this.prisma.caixa.findUnique({ where: { id } })
    if (!caixa) throw new NotFoundException(`Caixa ${id} não encontrada`)
    return caixa
  }

  async updateCaixa(id: string, dto: UpdateCaixaDto) {
    await this.findOneCaixa(id)
    const data: Record<string, unknown> = { ...dto }
    if (dto.fechadoPorId) data.fechadoEm = new Date()
    return this.prisma.caixa.update({ where: { id }, data })
  }
}
