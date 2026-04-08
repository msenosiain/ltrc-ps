import { IsString } from 'class-validator';

export class CheckinDto {
  @IsString()
  token: string;
}
