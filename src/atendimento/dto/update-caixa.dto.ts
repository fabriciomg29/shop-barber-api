import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class UpdateCaixaDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  fechadoPorId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoesFechamento?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalBruto?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalGorjetas?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  comissoesTotal?: number
}
