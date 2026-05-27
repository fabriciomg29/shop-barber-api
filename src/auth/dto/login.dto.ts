import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class LoginDto {
  @ApiProperty({ example: 'caio@ibirama.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: '123456' })
  @IsString()
  @IsNotEmpty()
  senha: string
}
