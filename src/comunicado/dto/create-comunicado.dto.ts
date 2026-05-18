import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'

export class CreateComunicadoDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiProperty()
  @IsUUID()
  autorId: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  titulo: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  corpo: string
}
