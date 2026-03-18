import { IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConfirmAttendanceDto {
  @IsOptional()
  @IsMongoId()
  readonly scheduleId?: string;

  @IsOptional()
  @IsString()
  readonly date?: string; // ISO date string, needed for virtual session materialization
}
