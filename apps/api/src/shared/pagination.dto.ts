import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  Min,
  IsObject,
  IsString,
  IsIn,
} from 'class-validator';

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  size = 10;

  @IsOptional()
  @IsObject()
  filters: any = {};

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sortOrder must be "asc" or "desc"' })
  readonly sortOrder?: 'asc' | 'desc';
}
