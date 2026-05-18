import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TipoNotificacao } from '@prisma/client'
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateNotificacaoDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  agendamentoId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clienteId?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  paraTelefone: string

  @ApiProperty({ enum: TipoNotificacao })
  @IsEnum(TipoNotificacao)
  tipo: TipoNotificacao

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  template: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  variaveis?: Record<string, unknown>
}
