import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { RoleUsuario } from '@prisma/client'
import { IsBoolean, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'

export class CreateUsuarioDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiProperty()
  @IsEmail()
  email: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  nome: string

  @ApiPropertyOptional({ enum: RoleUsuario, default: RoleUsuario.barbeiro })
  @IsOptional()
  @IsEnum(RoleUsuario)
  role?: RoleUsuario

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  ativo?: boolean
}
