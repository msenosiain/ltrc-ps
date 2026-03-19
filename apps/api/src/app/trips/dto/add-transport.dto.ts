import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TransportTypeEnum } from '@ltrc-campo/shared-api-model';

export class AddTransportDto {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsEnum(TransportTypeEnum)
  readonly type!: TransportTypeEnum;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly capacity!: number;

  @IsOptional()
  @IsString()
  readonly company?: string;

  @IsOptional()
  @IsString()
  readonly departureTime?: string;

  @IsOptional()
  @IsString()
  readonly notes?: string;
}
