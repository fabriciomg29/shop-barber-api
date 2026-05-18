import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateComissaoPagamentoDto } from './dto/create-comissao-pagamento.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class FinanceiroService {
  constructor(private readonly prisma: PrismaService) {}

  async createComissao(dto: CreateComissaoPagamentoDto) {
    return this.prisma.comissaoPagamento.create({ data: dto })
  }

  async findAllComissoes(
    page: number,
    limit: number,
    filters: { barbeariaId?: string; barbeiroId?: string },
  ) {
    const skip = (page - 1) * limit
    const where: Record<string, unknown> = {}
    if (filters.barbeariaId) where.barbeariaId = filters.barbeariaId
    if (filters.barbeiroId) where.barbeiroId = filters.barbeiroId
    const [data, total] = await Promise.all([
      this.prisma.comissaoPagamento.findMany({
        skip,
        take: limit,
        where,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.comissaoPagamento.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  async findOneComissao(id: string) {
    const comissao = await this.prisma.comissaoPagamento.findUnique({ where: { id } })
    if (!comissao) throw new NotFoundException(`Comissão ${id} não encontrada`)
    return comissao
  }
}
