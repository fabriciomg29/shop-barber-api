import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateComunicadoDto } from './dto/create-comunicado.dto'
import { CreateComunicadoLeituraDto } from './dto/create-comunicado-leitura.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class ComunicadoService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateComunicadoDto) {
    return this.prisma.comunicado.create({ data: dto })
  }

  async findAll(page: number, limit: number, barbeariaId?: string) {
    const skip = (page - 1) * limit
    const where = barbeariaId ? { barbeariaId } : {}
    const [data, total] = await Promise.all([
      this.prisma.comunicado.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      this.prisma.comunicado.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  async findOne(id: string) {
    const comunicado = await this.prisma.comunicado.findUnique({
      where: { id },
      include: { leituras: true },
    })
    if (!comunicado) throw new NotFoundException(`Comunicado ${id} não encontrado`)
    return comunicado
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.comunicado.delete({ where: { id } })
  }

  async marcarLido(comunicadoId: string, dto: CreateComunicadoLeituraDto) {
    await this.findOne(comunicadoId)
    return this.prisma.comunicadoLeitura.upsert({
      where: { comunicadoId_barbeiroId: { comunicadoId, barbeiroId: dto.barbeiroId } },
      create: { comunicadoId, barbeiroId: dto.barbeiroId },
      update: { lidoEm: new Date() },
    })
  }

  async getLeituras(comunicadoId: string) {
    await this.findOne(comunicadoId)
    return this.prisma.comunicadoLeitura.findMany({ where: { comunicadoId } })
  }
}
