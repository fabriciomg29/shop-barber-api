import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, Min } from 'class-validator'

export class CreateBarbeariaDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  endereco?: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  cidade: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  instagram?: string

  @ApiPropertyOptional({ default: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  cancelamentoMinHoras?: number

  @ApiPropertyOptional({ default: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  remarcacaoMinHoras?: number

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  lembreteWhatsappHoras?: number

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  fidelidadeSelosNecessarios?: number

  @ApiPropertyOptional({ default: 'Corte grátis' })
  @IsOptional()
  @IsString()
  fidelidadeRecompensa?: string

  @ApiPropertyOptional({ default: 60 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  fidelidadeDiasInatividade?: number

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  metaDiaria?: number

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  metaMensal?: number

  @ApiPropertyOptional({ description: 'JSON com horários por dia da semana' })
  @IsOptional()
  @IsObject()
  horariosFuncionamento?: Record<string, { abre: string; fecha: string } | null>
}
