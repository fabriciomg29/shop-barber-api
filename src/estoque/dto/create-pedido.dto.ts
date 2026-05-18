import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsArray, IsNumber, IsOptional, IsUUID, Min, ValidateNested } from 'class-validator'

export class PedidoItemDto {
  @ApiProperty()
  @IsUUID()
  produtoId: string

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  quantidade: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  custoUnitario?: number
}

export class CreatePedidoDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiProperty()
  @IsUUID()
  fornecedorId: string

  @ApiProperty()
  @IsUUID()
  criadoPorId: string

  @ApiProperty({ type: [PedidoItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PedidoItemDto)
  itens: PedidoItemDto[]
}
