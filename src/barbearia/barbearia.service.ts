import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateBarbeariaDto } from './dto/create-barbearia.dto'
import { UpdateBarbeariaDto } from './dto/update-barbearia.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class BarbeariaService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBarbeariaDto) {
    return this.prisma.barbearia.create({ data: dto })
  }

  async findAll(page: number, limit: number) {
    const skip = (page - 1) * limit
    const [data, total] = await Promise.all([
      this.prisma.barbearia.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } }),
      this.prisma.barbearia.count(),
    ])
    return paginated(data, total, page, limit)
  }

  async findOne(id: string) {
    const barbearia = await this.prisma.barbearia.findUnique({ where: { id } })
    if (!barbearia) throw new NotFoundException(`Barbearia ${id} não encontrada`)
    return barbearia
  }

  async update(id: string, dto: UpdateBarbeariaDto) {
    await this.findOne(id)
    return this.prisma.barbearia.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.barbearia.delete({ where: { id } })
  }
}
