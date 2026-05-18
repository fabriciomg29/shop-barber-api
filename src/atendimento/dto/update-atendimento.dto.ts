import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class UpdateAtendimentoDto {
  @ApiPropertyOptional({ minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  avaliacaoNota?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avaliacaoComentario?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  comissaoPaga?: boolean
}
