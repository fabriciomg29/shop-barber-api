import { ApiPropertyOptional } from '@nestjs/swagger'
import { OrigemCheckIn } from '@prisma/client'
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator'

export class CreatePontoDto {
  @ApiPropertyOptional({ example: '2025-05-17' })
  @IsOptional()
  @IsDateString()
  data?: string

  @ApiPropertyOptional({ example: '09:00' })
  @IsOptional()
  @IsString()
  checkIn?: string

  @ApiPropertyOptional({ example: '18:00' })
  @IsOptional()
  @IsString()
  checkOut?: string

  @ApiPropertyOptional({ enum: OrigemCheckIn })
  @IsOptional()
  @IsEnum(OrigemCheckIn)
  origemCheckIn?: OrigemCheckIn
}
