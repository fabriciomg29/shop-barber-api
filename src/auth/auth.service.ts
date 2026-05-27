import { Injectable, UnauthorizedException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { PrismaService } from '../prisma/prisma.service'
import { JwtPayload, TokenPair } from './auth.types'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto): Promise<TokenPair> {
    const usuario = await this.prisma.usuario.findUnique({ where: { email: dto.email } })
    if (!usuario || !usuario.ativo || !usuario.senhaHash) {
      throw new UnauthorizedException('Credenciais inválidas')
    }
    const senhaOk = await bcrypt.compare(dto.senha, usuario.senhaHash)
    if (!senhaOk) throw new UnauthorizedException('Credenciais inválidas')

    return this.issueTokens({
      sub: usuario.id,
      type: 'usuario',
      barbeariaId: usuario.barbeariaId,
      role: usuario.role,
    })
  }

  async clienteLogin(token: string): Promise<TokenPair> {
    const cliente = await this.prisma.cliente.findUnique({ where: { token } })
    if (!cliente) throw new UnauthorizedException('Token inválido')

    return this.issueTokens({
      sub: cliente.id,
      type: 'cliente',
      barbeariaId: cliente.barbeariaId,
    })
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
      })
    } catch {
      throw new UnauthorizedException('Refresh token inválido ou expirado')
    }

    return this.issueTokens({
      sub: payload.sub,
      type: payload.type,
      barbeariaId: payload.barbeariaId,
      role: payload.role,
    })
  }

  private async issueTokens(payload: JwtPayload): Promise<TokenPair> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET') ?? 'dev-access-secret',
        expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES') ?? '15m',
      }),
      this.jwt.signAsync(payload, {
        secret: this.config.get<string>('JWT_REFRESH_SECRET') ?? 'dev-refresh-secret',
        expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES') ?? '7d',
      }),
    ])
    return { accessToken, refreshToken }
  }
}
