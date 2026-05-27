import { RoleUsuario } from '@prisma/client'

export type SujeitoAuth = 'usuario' | 'cliente'

export interface JwtPayload {
  sub: string
  type: SujeitoAuth
  barbeariaId: string
  role?: RoleUsuario
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}
