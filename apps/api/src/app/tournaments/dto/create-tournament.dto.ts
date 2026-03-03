import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { CategoryEnum, SportEnum } from '@ltrc-ps/shared-api-model';

export class CreateTournamentDto {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsOptional()
  @IsString()
  readonly season?: string;

  @IsOptional()
  @IsString()
  readonly description?: string;

  @IsOptional()
  @IsEnum(SportEnum)
  readonly sport?: SportEnum;

  @IsOptional()
  @IsArray()
  @IsEnum(CategoryEnum, { each: true })
  readonly categories?: CategoryEnum[];
}
