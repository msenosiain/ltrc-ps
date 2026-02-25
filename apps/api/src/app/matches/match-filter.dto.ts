import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { MatchStatusEnum, MatchTypeEnum } from '@ltrc-ps/shared-api-model';

export class MatchFiltersDto {
  @IsOptional()
  @IsEnum(MatchStatusEnum)
  status?: MatchStatusEnum;

  @IsOptional()
  @IsEnum(MatchTypeEnum)
  type?: MatchTypeEnum;

  @IsOptional()
  @IsMongoId()
  tournament?: string;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;
}
