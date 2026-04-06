import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AttendanceStatusEnum } from '@ltrc-campo/shared-api-model';

export class AttendanceRecordDto {
  @IsOptional()
  @IsMongoId()
  readonly playerId?: string;

  @IsOptional()
  @IsString()
  readonly userId?: string;

  @IsOptional()
  @IsString()
  readonly userName?: string;

  @IsBoolean()
  readonly isStaff!: boolean;

  @IsOptional()
  @IsEnum([...Object.values(AttendanceStatusEnum), null])
  readonly status?: AttendanceStatusEnum | null;

  @IsOptional()
  @IsBoolean()
  readonly confirmed?: boolean;
}

export class RecordAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  readonly records!: AttendanceRecordDto[];
}
