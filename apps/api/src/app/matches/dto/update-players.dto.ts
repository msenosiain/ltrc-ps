import { IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SquadEntryDto } from './create-match.dto';

export class UpdateMatchSquadDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SquadEntryDto)
  readonly squad!: SquadEntryDto[];
}
