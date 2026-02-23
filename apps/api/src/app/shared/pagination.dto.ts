import { Transform, Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  Min,
  IsString,
  IsIn,
  ValidateNested,
} from 'class-validator';

export class PaginationDto<TFilter = any> {
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
  @ValidateNested()
  @Transform(({ value }) => {
    if (!value) return undefined;
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as TFilter;
      } catch (err) {
        return undefined; // o lanzar un error
      }
    }
    return value as TFilter;
  })
  filters?: TFilter;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'], { message: 'sortOrder must be "asc" or "desc"' })
  readonly sortOrder?: 'asc' | 'desc';
}
