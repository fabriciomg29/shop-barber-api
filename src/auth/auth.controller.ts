import { Body, Controller, Get, HttpCode, HttpStatus, Post } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { JwtPayload } from './auth.types'
import { CurrentUser } from './decorators/current-user.decorator'
import { Public } from './decorators/public.decorator'
import { ClienteLoginDto } from './dto/cliente-login.dto'
import { LoginDto } from './dto/login.dto'
import { RefreshDto } from './dto/refresh.dto'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly service: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de usuário (email + senha)' })
  login(@Body() dto: LoginDto) {
    return this.service.login(dto)
  }

  @Public()
  @Post('cliente/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login de cliente (token)' })
  clienteLogin(@Body() dto: ClienteLoginDto) {
    return this.service.clienteLogin(dto.token)
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Renovar tokens a partir do refresh token' })
  refresh(@Body() dto: RefreshDto) {
    return this.service.refresh(dto.refreshToken)
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Retorna o payload do token autenticado' })
  me(@CurrentUser() user: JwtPayload) {
    return user
  }
}
