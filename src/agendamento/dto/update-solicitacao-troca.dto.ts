import { ApiProperty } from '@nestjs/swagger'
import { StatusSolicitacaoTroca } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdateSolicitacaoTrocaDto {
  @ApiProperty({ enum: StatusSolicitacaoTroca })
  @IsEnum(StatusSolicitacaoTroca)
  status: StatusSolicitacaoTroca
}
