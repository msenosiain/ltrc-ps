import { IsString, MinLength } from 'class-validator';

export class ValidateDniDto {
  @IsString()
  @MinLength(6)
  readonly dni!: string;
}
