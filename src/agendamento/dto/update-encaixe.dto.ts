import { ApiPropertyOptional } from '@nestjs/swagger'
import { StatusEncaixe } from '@prisma/client'
import { IsEnum, IsNumber, IsOptional, IsUUID, Min } from 'class-validator'

export class UpdateEncaixeDto {
  @ApiPropertyOptional({ enum: StatusEncaixe })
  @IsOptional()
  @IsEnum(StatusEncaixe)
  status?: StatusEncaixe

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(1)
  posicao?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimativaMin?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  agendamentoId?: string
}
