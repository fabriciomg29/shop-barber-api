import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { OrigemMovimentacao, TipoMovimentacaoEstoque } from '@prisma/client'
import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class CreateMovimentacaoDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string

  @ApiProperty({ enum: TipoMovimentacaoEstoque })
  @IsEnum(TipoMovimentacaoEstoque)
  tipo: TipoMovimentacaoEstoque

  @ApiProperty({ enum: OrigemMovimentacao })
  @IsEnum(OrigemMovimentacao)
  origem: OrigemMovimentacao

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  quantidade: number

  @ApiProperty()
  @IsNumber()
  estoqueAntes: number

  @ApiProperty()
  @IsNumber()
  estoqueDepois: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  atendimentoId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  pedidoId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacao?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  criadoPorId?: string
}
