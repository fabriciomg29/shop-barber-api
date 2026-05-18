import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { FormaPagamento } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator'

export class AtendimentoServicoDto {
  @ApiProperty()
  @IsUUID()
  servicoId: string

  @ApiProperty()
  @IsNumber()
  @Min(0)
  precoSnapshot: number
}

export class AtendimentoProdutoDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string

  @ApiProperty()
  @IsNumber()
  @Min(0)
  quantidade: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  precoSnapshot?: number
}

export class CreateAtendimentoDto {
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
  caixaId?: string

  @ApiProperty()
  @IsUUID()
  barbeiroId: string

  @ApiProperty()
  @IsUUID()
  clienteId: string

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  valorBruto: number

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gorjeta?: number

  @ApiProperty({ enum: FormaPagamento })
  @IsEnum(FormaPagamento)
  formaPagamento: FormaPagamento

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  comissaoCalculada: number

  @ApiPropertyOptional({ type: [AtendimentoServicoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AtendimentoServicoDto)
  servicos?: AtendimentoServicoDto[]

  @ApiPropertyOptional({ type: [AtendimentoProdutoDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AtendimentoProdutoDto)
  produtos?: AtendimentoProdutoDto[]
}
