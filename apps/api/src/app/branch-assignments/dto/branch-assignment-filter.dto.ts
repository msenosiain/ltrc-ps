import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsMongoId, IsOptional, Min } from 'class-validator';
import {
  CategoryEnum,
  HockeyBranchEnum,
} from '@ltrc-campo/shared-api-model';

export class BranchAssignmentFilterDto {
  @IsMongoId()
  @IsOptional()
  player?: string;

  @IsEnum(HockeyBranchEnum)
  @IsOptional()
  branch?: HockeyBranchEnum;

  @IsEnum(CategoryEnum)
  @IsOptional()
  category?: CategoryEnum;

  @Transform(({ value }) => (value != null ? Number(value) : undefined))
  @IsInt()
  @Min(2020)
  @IsOptional()
  season?: number;
}
