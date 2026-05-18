import { Injectable, NotFoundException } from '@nestjs/common'
import { StatusNotificacao } from '@prisma/client'
import { PrismaService } from '../prisma/prisma.service'
import { CreateNotificacaoDto } from './dto/create-notificacao.dto'
import { UpdateNotificacaoStatusDto } from './dto/update-notificacao-status.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class NotificacaoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateNotificacaoDto) {
    const { variaveis, ...rest } = dto
    return this.prisma.notificacaoWhatsapp.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { ...rest, variaveis: (variaveis ?? {}) as any },
    })
  }

  async findAll(
    page: number,
    limit: number,
    filters: { barbeariaId?: string; status?: StatusNotificacao },
  ) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}
    if (filters.barbeariaId) where.barbeariaId = filters.barbeariaId
    if (filters.status) where.status = filters.status
    const [data, total] = await Promise.all([
      this.prisma.notificacaoWhatsapp.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notificacaoWhatsapp.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  async findOne(id: string) {
    const notificacao = await this.prisma.notificacaoWhatsapp.findUnique({ where: { id } })
    if (!notificacao) throw new NotFoundException(`Notificação ${id} não encontrada`)
    return notificacao
  }

  async updateStatus(id: string, dto: UpdateNotificacaoStatusDto) {
    await this.findOne(id)
    const data: Record<string, unknown> = { status: dto.status }
    if (dto.erroMensagem) data.erroMensagem = dto.erroMensagem
    if (dto.status === StatusNotificacao.enviado) data.enviadoEm = new Date()
    return this.prisma.notificacaoWhatsapp.update({ where: { id }, data })
  }
}
