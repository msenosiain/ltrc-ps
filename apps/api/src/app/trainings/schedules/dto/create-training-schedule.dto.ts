import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  CategoryEnum,
  DayOfWeekEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

export class TimeSlotDto {
  @IsEnum(DayOfWeekEnum)
  day!: DayOfWeekEnum;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:mm format' })
  startTime!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be in HH:mm format' })
  endTime!: string;

  @IsOptional()
  @IsString()
  location?: string;
}

export class CreateTrainingScheduleDto {
  @IsNotEmpty()
  @IsEnum(SportEnum)
  readonly sport!: SportEnum;

  @IsNotEmpty()
  @IsEnum(CategoryEnum)
  readonly category!: CategoryEnum;

  @IsOptional()
  @IsString()
  readonly division?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  readonly timeSlots!: TimeSlotDto[];

  @IsOptional()
  @IsBoolean()
  readonly isActive?: boolean;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'validFrom must be in YYYY-MM-DD format' })
  readonly validFrom?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'validUntil must be in YYYY-MM-DD format' })
  readonly validUntil?: string;
}
