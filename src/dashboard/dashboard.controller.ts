import { Controller, Get, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiPropertyOptional, ApiTags } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsUUID } from 'class-validator'
import { DashboardService } from './dashboard.service'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { JwtPayload } from '../auth/auth.types'

class DashboardQueryDto {
  @ApiPropertyOptional({
    example: '2026-05-14',
    description: 'Data de referência do painel. Default: hoje.',
  })
  @IsOptional()
  @IsDateString()
  data?: string

  @ApiPropertyOptional({
    description: 'Sobrescreve a barbearia do token (uso administrativo/testes).',
  })
  @IsOptional()
  @IsUUID()
  barbeariaId?: string
}

@ApiTags('Dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Resumo do painel',
    description:
      'Retorna em uma única chamada todos os dados que alimentam o dashboard: faturamento do dia, ' +
      'KPIs, faturamento dos últimos 14 dias, mapa de ocupação, ranking do mês, top serviços, ' +
      'formas de pagamento e o painel "agora na barbearia".',
  })
  resumo(@CurrentUser() user: JwtPayload, @Query() query: DashboardQueryDto) {
    const barbeariaId = query.barbeariaId ?? user.barbeariaId
    return this.service.getResumo(barbeariaId, query.data)
  }
}
