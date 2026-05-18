import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class CreateServicoDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiProperty({ example: 'corte' })
  @IsString()
  @IsNotEmpty()
  slug: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  duracaoMin: number

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  preco: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icone?: string

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  popular?: boolean

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean
}
