import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentEntityTypeEnum, PaymentTypeEnum } from '@ltrc-campo/shared-api-model';

export class CreatePaymentLinkDto {
  @IsEnum(PaymentEntityTypeEnum)
  readonly entityType!: PaymentEntityTypeEnum;

  @IsString()
  readonly entityId!: string;

  @IsString()
  readonly concept!: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  readonly amount!: number;

  @IsEnum(PaymentTypeEnum)
  readonly paymentType!: PaymentTypeEnum;

  @ValidateIf((o) => o.paymentType === PaymentTypeEnum.INSTALLMENT)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly installmentNumber?: number;

  @ValidateIf((o) => o.paymentType === PaymentTypeEnum.INSTALLMENT)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  readonly installmentTotal?: number;

  @IsDateString()
  readonly expiresAt!: string;
}
