import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateServicoDto } from './dto/create-servico.dto'
import { UpdateServicoDto } from './dto/update-servico.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class ServicoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateServicoDto) {
    return this.prisma.servico.create({ data: dto })
  }

  async findAll(page: number, limit: number, barbeariaId?: string) {
    const skip = (page - 1) * limit
    const where = barbeariaId ? { barbeariaId } : {}
    const [data, total] = await Promise.all([
      this.prisma.servico.findMany({ skip, take: limit, where, orderBy: { nome: 'asc' } }),
      this.prisma.servico.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  async findOne(id: string) {
    const servico = await this.prisma.servico.findUnique({ where: { id } })
    if (!servico) throw new NotFoundException(`Serviço ${id} não encontrado`)
    return servico
  }

  async update(id: string, dto: UpdateServicoDto) {
    await this.findOne(id)
    return this.prisma.servico.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.servico.delete({ where: { id } })
  }
}
