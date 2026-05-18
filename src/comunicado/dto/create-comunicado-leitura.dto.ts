import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class CreateComunicadoLeituraDto {
  @ApiProperty()
  @IsUUID()
  barbeiroId: string
}
