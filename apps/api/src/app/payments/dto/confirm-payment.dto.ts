import { IsOptional, IsString } from 'class-validator';

export class ConfirmPaymentDto {
  @IsString()
  readonly externalReference!: string;

  @IsOptional()
  @IsString()
  readonly paymentId?: string;

  @IsOptional()
  @IsString()
  readonly status?: string;
}
