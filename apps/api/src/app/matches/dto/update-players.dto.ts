import { IsArray, IsMongoId } from 'class-validator';

export class UpdateMatchPlayersDto {
  @IsArray()
  @IsMongoId({ each: true })
  readonly playerIds!: string[];
}
