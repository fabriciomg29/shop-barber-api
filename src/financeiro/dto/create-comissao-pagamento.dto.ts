import { ApiProperty } from '@nestjs/swagger'
import { FormaPagamento } from '@prisma/client'
import { IsDateString, IsEnum, IsNumber, IsUUID, Min } from 'class-validator'

export class CreateComissaoPagamentoDto {
  @ApiProperty()
  @IsUUID()
  barbeariaId: string

  @ApiProperty()
  @IsUUID()
  barbeiroId: string

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  valor: number

  @ApiProperty({ enum: FormaPagamento })
  @IsEnum(FormaPagamento)
  formaPagamento: FormaPagamento

  @ApiProperty({ example: '2025-05-01' })
  @IsDateString()
  periodoInicio: string

  @ApiProperty({ example: '2025-05-31' })
  @IsDateString()
  periodoFim: string

  @ApiProperty()
  @IsUUID()
  registradoPorId: string
}
