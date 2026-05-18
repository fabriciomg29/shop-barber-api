import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { StatusNotificacao } from '@prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

export class UpdateNotificacaoStatusDto {
  @ApiProperty({ enum: StatusNotificacao })
  @IsEnum(StatusNotificacao)
  status: StatusNotificacao

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  erroMensagem?: string
}
