import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { RoleUsuario } from '@prisma/client'
import { Request } from 'express'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { JwtPayload } from '../auth.types'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<RoleUsuario[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required || required.length === 0) return true

    const { user } = context.switchToHttp().getRequest<Request & { user?: JwtPayload }>()
    if (!user || user.type !== 'usuario' || !user.role || !required.includes(user.role)) {
      throw new ForbiddenException('Acesso negado para o seu perfil')
    }
    return true
  }
}
