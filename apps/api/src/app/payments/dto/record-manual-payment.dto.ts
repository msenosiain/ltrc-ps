import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PaymentEntityTypeEnum,
  PaymentMethodEnum,
} from '@ltrc-campo/shared-api-model';

export class RecordManualPaymentDto {
  @IsEnum(PaymentEntityTypeEnum)
  readonly entityType!: PaymentEntityTypeEnum;

  @IsString()
  readonly entityId!: string;

  @IsString()
  readonly playerId!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  readonly amount!: number;

  @IsEnum(PaymentMethodEnum)
  readonly method!: PaymentMethodEnum;

  @IsString()
  readonly concept!: string;

  @IsDateString()
  readonly date!: string;

  @IsOptional()
  @IsString()
  readonly notes?: string;
}
