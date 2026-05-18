import { Injectable, NotFoundException } from '@nestjs/common'
import { StatusAgendamento, StatusEncaixe } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateAgendamentoDto } from './dto/create-agendamento.dto'
import { UpdateAgendamentoDto } from './dto/update-agendamento.dto'
import { CreateEncaixeDto } from './dto/create-encaixe.dto'
import { UpdateEncaixeDto } from './dto/update-encaixe.dto'
import { CreateSolicitacaoTrocaDto } from './dto/create-solicitacao-troca.dto'
import { UpdateSolicitacaoTrocaDto } from './dto/update-solicitacao-troca.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class AgendamentoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAgendamentoDto) {
    return this.prisma.agendamento.create({ data: dto })
  }

  async findAll(
    page: number,
    limit: number,
    filters: {
      barbeariaId?: string
      barbeiroId?: string
      data?: string
      status?: StatusAgendamento
    },
  ) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}
    if (filters.barbeariaId) where.barbeariaId = filters.barbeariaId
    if (filters.barbeiroId) where.barbeiroId = filters.barbeiroId
    if (filters.data) where.data = new Date(filters.data)
    if (filters.status) where.status = filters.status

    const [data, total] = await Promise.all([
      this.prisma.agendamento.findMany({ skip, take: limit, where, orderBy: { data: 'desc' } }),
      this.prisma.agendamento.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  async findOne(id: string) {
    const agendamento = await this.prisma.agendamento.findUnique({ where: { id } })
    if (!agendamento) throw new NotFoundException(`Agendamento ${id} não encontrado`)
    return agendamento
  }

  async update(id: string, dto: UpdateAgendamentoDto) {
    await this.findOne(id)
    return this.prisma.agendamento.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.agendamento.delete({ where: { id } })
  }

  // Encaixes
  async createEncaixe(dto: CreateEncaixeDto) {
    return this.prisma.encaixe.create({ data: dto })
  }

  async findAllEncaixes(barbeariaId?: string, status?: StatusEncaixe) {
    const where: Record<string, unknown> = {}
    if (barbeariaId) where.barbeariaId = barbeariaId
    if (status) where.status = status
    return this.prisma.encaixe.findMany({ where, orderBy: { posicao: 'asc' } })
  }

  async updateEncaixe(id: string, dto: UpdateEncaixeDto) {
    const encaixe = await this.prisma.encaixe.findUnique({ where: { id } })
    if (!encaixe) throw new NotFoundException(`Encaixe ${id} não encontrado`)
    return this.prisma.encaixe.update({ where: { id }, data: dto })
  }

  // Trocas
  async createTroca(dto: CreateSolicitacaoTrocaDto) {
    return this.prisma.solicitacaoTroca.create({ data: dto })
  }

  async updateTroca(id: string, dto: UpdateSolicitacaoTrocaDto) {
    const troca = await this.prisma.solicitacaoTroca.findUnique({ where: { id } })
    if (!troca) throw new NotFoundException(`Solicitação de troca ${id} não encontrada`)
    return this.prisma.solicitacaoTroca.update({ where: { id }, data: dto })
  }
}
