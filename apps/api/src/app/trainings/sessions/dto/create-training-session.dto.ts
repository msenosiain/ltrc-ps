import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import {
  CategoryEnum,
  SportEnum,
  TrainingSessionStatusEnum,
} from '@ltrc-campo/shared-api-model';

export class CreateTrainingSessionDto {
  @IsOptional()
  @IsMongoId()
  readonly schedule?: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  readonly date!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'startTime must be in HH:mm format' })
  readonly startTime!: string;

  @IsString()
  @Matches(/^\d{2}:\d{2}$/, { message: 'endTime must be in HH:mm format' })
  readonly endTime!: string;

  @IsNotEmpty()
  @IsEnum(SportEnum)
  readonly sport!: SportEnum;

  @IsNotEmpty()
  @IsEnum(CategoryEnum)
  readonly category!: CategoryEnum;

  @IsOptional()
  @IsString()
  readonly division?: string;

  @IsOptional()
  @IsString()
  readonly location?: string;

  @IsOptional()
  @IsEnum(TrainingSessionStatusEnum)
  readonly status?: TrainingSessionStatusEnum;

  @IsOptional()
  @IsString()
  readonly notes?: string;
}
