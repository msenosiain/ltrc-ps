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
import { AttendanceStatusEnum } from '@ltrc-ps/shared-api-model';

export class AttendanceRecordDto {
  @IsOptional()
  @IsMongoId()
  readonly playerId?: string;

  @IsOptional()
  @IsString()
  readonly userId?: string;

  @IsBoolean()
  readonly isStaff!: boolean;

  @IsEnum(AttendanceStatusEnum)
  readonly status!: AttendanceStatusEnum;
}

export class RecordAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto)
  readonly records!: AttendanceRecordDto[];
}
