import { ApiProperty } from '@nestjs/swagger'
import { StatusPedidoFornecedor } from '@prisma/client'
import { IsEnum } from 'class-validator'

export class UpdatePedidoDto {
  @ApiProperty({ enum: StatusPedidoFornecedor })
  @IsEnum(StatusPedidoFornecedor)
  status: StatusPedidoFornecedor
}
