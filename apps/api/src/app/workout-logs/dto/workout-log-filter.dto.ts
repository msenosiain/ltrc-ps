import { IsOptional, IsString } from 'class-validator';

export class WorkoutLogFilterDto {
  @IsOptional() @IsString() playerId?: string;
  @IsOptional() @IsString() routineId?: string;
  @IsOptional() @IsString() dateFrom?: string;
  @IsOptional() @IsString() dateTo?: string;
  @IsOptional() @IsString() status?: string;
}
