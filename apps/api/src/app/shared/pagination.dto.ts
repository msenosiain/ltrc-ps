import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, Min, IsString } from 'class-validator';
import { SortOrder } from '@ltrc-campo/shared-api-model';

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
  @IsEnum(SortOrder, { message: 'sortOrder must be "asc" or "desc"' })
  readonly sortOrder?: SortOrder;
}
