import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TripParticipantStatusEnum } from '@ltrc-ps/shared-api-model';

export class UpdateParticipantDto {
  @IsOptional()
  @IsEnum(TripParticipantStatusEnum)
  readonly status?: TripParticipantStatusEnum;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  readonly costAssigned?: number;

  @IsOptional()
  @IsString()
  readonly specialNeeds?: string;

  @IsOptional()
  @IsBoolean()
  readonly documentationOk?: boolean;

  @IsOptional()
  @IsString()
  readonly accompanyingParticipantId?: string;
}
