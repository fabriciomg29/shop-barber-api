import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsNumber, IsOptional, IsUUID, Min } from 'class-validator'

export class CreateCaixaDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiProperty({ example: '2025-05-17' })
  @IsDateString()
  data: string

  @ApiProperty()
  @IsUUID()
  abertoPorId: string

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  trocoInicial?: number
}
