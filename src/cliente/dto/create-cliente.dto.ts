import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator'

export class CreateClienteDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string

  @ApiPropertyOptional({ maxLength: 3 })
  @IsOptional()
  @IsString()
  @Length(1, 3)
  iniciais?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  telefone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional({ example: '1990-01-15' })
  @IsOptional()
  @IsDateString()
  dataNascimento?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  observacoes?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  barbeiroPreferidoId?: string

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  consentimentoLgpd?: boolean
}
