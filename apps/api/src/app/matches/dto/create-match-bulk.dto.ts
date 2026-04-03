import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform } from 'class-transformer';
import {
  CategoryEnum,
  HockeyBranchEnum,
  MatchStatusEnum,
  SportEnum,
  parseDate,
} from '@ltrc-campo/shared-api-model';

export class CreateMatchBulkDto {
  @IsNotEmpty()
  @Transform(({ value }) => parseDate(value))
  @IsDate({ message: '$property must be a valid date (dd/MM/yyyy)' })
  readonly date!: Date;

  @IsOptional()
  @IsString()
  readonly name?: string;

  @IsOptional()
  @IsString()
  readonly opponent?: string;

  @IsNotEmpty()
  @IsString()
  readonly venue!: string;

  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  readonly isHome?: boolean;

  @IsOptional()
  @IsEnum(MatchStatusEnum)
  readonly status?: MatchStatusEnum;

  @IsOptional()
  @IsEnum(SportEnum)
  readonly sport?: SportEnum;

  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @IsEnum(CategoryEnum, { each: true })
  readonly categories!: CategoryEnum[];

  @IsOptional()
  @IsEnum(HockeyBranchEnum)
  readonly branch?: HockeyBranchEnum;

  @IsOptional()
  @IsMongoId()
  readonly tournament?: string;

  @IsOptional()
  @IsString()
  readonly notes?: string;
}
