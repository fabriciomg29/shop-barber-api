import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateUsuarioDto } from './dto/create-usuario.dto'
import { UpdateUsuarioDto } from './dto/update-usuario.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class UsuarioService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUsuarioDto) {
    return this.prisma.usuario.create({ data: dto })
  }

  async findAll(page: number, limit: number, barbeariaId?: string) {
    const skip = (page - 1) * limit
    const where = barbeariaId ? { barbeariaId } : {}
    const [data, total] = await Promise.all([
      this.prisma.usuario.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      this.prisma.usuario.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  async findOne(id: string) {
    const usuario = await this.prisma.usuario.findUnique({ where: { id } })
    if (!usuario) throw new NotFoundException(`Usuário ${id} não encontrado`)
    return usuario
  }

  async update(id: string, dto: UpdateUsuarioDto) {
    await this.findOne(id)
    return this.prisma.usuario.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.usuario.delete({ where: { id } })
  }
}
