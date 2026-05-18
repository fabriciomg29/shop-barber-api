import { PartialType } from '@nestjs/swagger'
import { CreateBarbeariaDto } from './create-barbearia.dto'

export class UpdateBarbeariaDto extends PartialType(CreateBarbeariaDto) {}
