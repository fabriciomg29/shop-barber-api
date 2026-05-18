import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator'

export class CreateBarbeiroDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  usuarioId?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  apelido: string

  @ApiProperty({ maxLength: 3 })
  @IsString()
  @Length(1, 3)
  iniciais: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  papel?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fotoUrl?: string

  @ApiPropertyOptional({ description: 'Hex color, ex: #A07850' })
  @IsOptional()
  @IsString()
  @Length(7, 7)
  tomDePele?: string

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  anosDeOficio?: number

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  comissaoPercentual?: number

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  metaMensal?: number

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  especialidades?: string[]

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean
}
