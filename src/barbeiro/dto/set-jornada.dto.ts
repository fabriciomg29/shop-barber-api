import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DiaSemana, JornadaTipo } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator'

export class JornadaDiaDto {
  @ApiProperty({ enum: DiaSemana })
  @IsEnum(DiaSemana)
  diaSemana: DiaSemana

  @ApiProperty({ enum: JornadaTipo })
  @IsEnum(JornadaTipo)
  tipo: JornadaTipo

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  inicio?: string

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  fim?: string
}

export class SetJornadaDto {
  @ApiProperty({ type: [JornadaDiaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JornadaDiaDto)
  jornada: JornadaDiaDto[]
}
