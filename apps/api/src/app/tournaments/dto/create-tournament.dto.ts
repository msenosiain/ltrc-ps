import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
}
