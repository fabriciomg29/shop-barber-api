import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsUUID } from 'class-validator'

export class ClienteLoginDto {
  @ApiProperty({ description: 'Token de acesso do cliente' })
  @IsString()
  @IsUUID()
  token: string
}
