import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { TipoProduto } from '@prisma/client'
import { IsBoolean, IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class CreateProdutoDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  fornecedorId?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  marca?: string

  @ApiPropertyOptional({ enum: TipoProduto, default: TipoProduto.insumo })
  @IsOptional()
  @IsEnum(TipoProduto)
  tipo?: TipoProduto

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  consumivel?: boolean

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estoqueAtual?: number

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  estoqueMinimo?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoCusto?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoVenda?: number

  @ApiPropertyOptional({ example: '2025-05-17' })
  @IsOptional()
  @IsDateString()
  ultimaCompra?: string

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean
}
