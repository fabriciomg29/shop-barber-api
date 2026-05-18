import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateSolicitacaoTrocaDto {
  @ApiProperty()
  @IsUUID()
  agendamentoId: string

  @ApiProperty()
  @IsUUID()
  deBarbeiroId: string

  @ApiProperty()
  @IsUUID()
  paraBarbeiroId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  motivo?: string
}
