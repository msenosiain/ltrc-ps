import { IsBoolean, IsEnum } from 'class-validator';
import { CategoryEnum, SportEnum } from '@ltrc-campo/shared-api-model';

export class ToggleEvaluationSettingsDto {
  @IsEnum(CategoryEnum)
  category: CategoryEnum;

  @IsEnum(SportEnum)
  sport: SportEnum;

  @IsBoolean()
  evaluationsEnabled: boolean;
}
