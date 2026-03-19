import { IsEnum, IsOptional } from 'class-validator';
import { HockeyBranchEnum } from '@ltrc-campo/shared-api-model';

export class UpdateBranchAssignmentDto {
  @IsEnum(HockeyBranchEnum)
  @IsOptional()
  readonly branch?: HockeyBranchEnum;
}
