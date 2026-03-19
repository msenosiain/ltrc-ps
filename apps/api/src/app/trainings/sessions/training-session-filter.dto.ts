import { IsEnum, IsOptional, IsString } from 'class-validator';
import {
  CategoryEnum,
  SportEnum,
  TrainingSessionStatusEnum,
} from '@ltrc-campo/shared-api-model';

export class TrainingSessionFiltersDto {
  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;

  @IsOptional()
  @IsEnum(CategoryEnum)
  category?: CategoryEnum;

  @IsOptional()
  @IsEnum(TrainingSessionStatusEnum)
  status?: TrainingSessionStatusEnum;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
}
