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

export class MatchAttendanceRecordDto {
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

export class RecordMatchAttendanceDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MatchAttendanceRecordDto)
  readonly records!: MatchAttendanceRecordDto[];
}
