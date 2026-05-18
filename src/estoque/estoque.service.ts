import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFornecedorDto } from './dto/create-fornecedor.dto'
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto'
import { CreateProdutoDto } from './dto/create-produto.dto'
import { UpdateProdutoDto } from './dto/update-produto.dto'
import { CreateMovimentacaoDto } from './dto/create-movimentacao.dto'
import { CreatePedidoDto } from './dto/create-pedido.dto'
import { UpdatePedidoDto } from './dto/update-pedido.dto'
import { paginated } from '../common/dto/pagination.dto'

@Injectable()
export class EstoqueService {
  constructor(private readonly prisma: PrismaService) {}

  // Fornecedores
  async createFornecedor(dto: CreateFornecedorDto) {
    return this.prisma.fornecedor.create({ data: dto })
  }

  async findAllFornecedores(barbeariaId?: string) {
    const where = barbeariaId ? { barbeariaId } : {}
    return this.prisma.fornecedor.findMany({ where, orderBy: { nome: 'asc' } })
  }

  async updateFornecedor(id: string, dto: UpdateFornecedorDto) {
    const found = await this.prisma.fornecedor.findUnique({ where: { id } })
    if (!found) throw new NotFoundException(`Fornecedor ${id} não encontrado`)
    return this.prisma.fornecedor.update({ where: { id }, data: dto })
  }

  async removeFornecedor(id: string) {
    const found = await this.prisma.fornecedor.findUnique({ where: { id } })
    if (!found) throw new NotFoundException(`Fornecedor ${id} não encontrado`)
    return this.prisma.fornecedor.delete({ where: { id } })
  }

  // Produtos
  async createProduto(dto: CreateProdutoDto) {
    return this.prisma.produto.create({ data: dto })
  }

  async findAllProdutos(page: number, limit: number, barbeariaId?: string) {
    const skip = (page - 1) * limit
    const where = barbeariaId ? { barbeariaId } : {}
    const [data, total] = await Promise.all([
      this.prisma.produto.findMany({ skip, take: limit, where, orderBy: { nome: 'asc' } }),
      this.prisma.produto.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  async findOneProduto(id: string) {
    const produto = await this.prisma.produto.findUnique({ where: { id } })
    if (!produto) throw new NotFoundException(`Produto ${id} não encontrado`)
    return produto
  }

  async updateProduto(id: string, dto: UpdateProdutoDto) {
    await this.findOneProduto(id)
    return this.prisma.produto.update({ where: { id }, data: dto })
  }

  async removeProduto(id: string) {
    await this.findOneProduto(id)
    return this.prisma.produto.delete({ where: { id } })
  }

  // Movimentações
  async createMovimentacao(dto: CreateMovimentacaoDto) {
    return this.prisma.movimentacaoEstoque.create({ data: dto })
  }

  async findAllMovimentacoes(page: number, limit: number, produtoId?: string) {
    const skip = (page - 1) * limit
    const where = produtoId ? { produtoId } : {}
    const [data, total] = await Promise.all([
      this.prisma.movimentacaoEstoque.findMany({ skip, take: limit, where, orderBy: { createdAt: 'desc' } }),
      this.prisma.movimentacaoEstoque.count({ where }),
    ])
    return paginated(data, total, page, limit)
  }

  // Pedidos
  async createPedido(dto: CreatePedidoDto) {
    const { itens, ...rest } = dto
    return this.prisma.pedidoFornecedor.create({
      data: {
        ...rest,
        itens: { createMany: { data: itens } },
      },
      include: { itens: true },
    })
  }

  async findAllPedidos(barbeariaId?: string) {
    const where = barbeariaId ? { barbeariaId } : {}
    return this.prisma.pedidoFornecedor.findMany({
      where,
      include: { itens: true },
      orderBy: { createdAt: 'desc' },
    })
  }

  async updatePedido(id: string, dto: UpdatePedidoDto) {
    const found = await this.prisma.pedidoFornecedor.findUnique({ where: { id } })
    if (!found) throw new NotFoundException(`Pedido ${id} não encontrado`)
    return this.prisma.pedidoFornecedor.update({ where: { id }, data: dto })
  }
}
