import {
  IsArray,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SquadEntryDto {
  @IsInt()
  @Min(1)
  @Max(26)
  shirtNumber!: number;

  @IsMongoId()
  playerId!: string;
}

export class CreateSquadDto {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SquadEntryDto)
  readonly players!: SquadEntryDto[];
}
