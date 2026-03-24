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
  @IsEnum(AttendanceStatusEnum)
  readonly status?: AttendanceStatusEnum;

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
