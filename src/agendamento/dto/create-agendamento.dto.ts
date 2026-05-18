import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { OrigemAgendamento, StatusAgendamento } from '@prisma/client'
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator'

export class CreateAgendamentoDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiProperty()
  @IsUUID()
  barbeiroId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  clienteId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  servicoId?: string

  @ApiProperty({ example: '2025-05-17' })
  @IsDateString()
  data: string

  @ApiProperty({ example: '09:00' })
  @IsString()
  @IsNotEmpty()
  inicio: string

  @ApiProperty({ example: '09:30' })
  @IsString()
  @IsNotEmpty()
  fim: string

  @ApiPropertyOptional({ enum: StatusAgendamento, default: StatusAgendamento.confirmado })
  @IsOptional()
  @IsEnum(StatusAgendamento)
  status?: StatusAgendamento

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoSnapshot?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string

  @ApiPropertyOptional({ enum: OrigemAgendamento, default: OrigemAgendamento.cliente_online })
  @IsOptional()
  @IsEnum(OrigemAgendamento)
  origem?: OrigemAgendamento
}
