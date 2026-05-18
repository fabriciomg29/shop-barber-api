import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator'

export class CreateEncaixeDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  clienteNome: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone?: string

  @ApiProperty()
  @IsUUID()
  servicoId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeiroPreferidoId?: string

  @ApiProperty({ minimum: 1 })
  @IsNumber()
  @Min(1)
  posicao: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  estimativaMin?: number
}
