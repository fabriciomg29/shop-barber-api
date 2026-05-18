import { PartialType } from '@nestjs/swagger'
import { CreateBarbeiroDto } from './create-barbeiro.dto'

export class UpdateBarbeiroDto extends PartialType(CreateBarbeiroDto) {}
