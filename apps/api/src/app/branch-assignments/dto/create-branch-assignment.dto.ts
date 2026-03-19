import {
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  Min,
} from 'class-validator';
import {
  CategoryEnum,
  HockeyBranchEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

export class CreateBranchAssignmentDto {
  @IsMongoId()
  @IsNotEmpty()
  readonly player: string;

  @IsEnum(HockeyBranchEnum)
  @IsNotEmpty()
  readonly branch: HockeyBranchEnum;

  @IsEnum(CategoryEnum)
  @IsNotEmpty()
  readonly category: CategoryEnum;

  @IsInt()
  @Min(2020)
  readonly season: number;

  @IsEnum(SportEnum)
  @IsOptional()
  readonly sport?: SportEnum;
}
