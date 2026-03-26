import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryEnum, WorkoutStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';

export class WorkoutFilterDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;

  @IsOptional()
  @IsEnum(CategoryEnum)
  category?: CategoryEnum;

  @IsOptional()
  @IsEnum(WorkoutStatusEnum)
  status?: WorkoutStatusEnum;

  @IsOptional()
  @IsString()
  playerId?: string;
}
