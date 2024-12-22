import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { PlayerPositionEnum } from '../interfaces/player-position.enum';
import { Transform, Type } from 'class-transformer';
import { parse } from 'date-fns';

export class CreatePlayerDto {


  @IsNotEmpty()
  @IsString()
  readonly lastName: string;

  @IsNotEmpty()
  @IsString()
  readonly firstName: string;

  @IsNotEmpty()
  @IsString()
  readonly idNumber: string;

  @IsNotEmpty()
  @IsString()
  @Type(() => Date)
  @Transform(({ value }) => parse(String(value), 'dd-MM-yyyy', new Date()), { toClassOnly: true })
  readonly birthDate: Date;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsString()
  readonly phoneNumber: string;

  @IsNotEmpty()
  @IsEnum(PlayerPositionEnum)
  readonly position: string;

  @IsOptional()
  @IsString()
  readonly address?: string;

  @IsOptional()
  @IsString()
  readonly city?: string;

  @IsOptional()
  @IsString()
  readonly province?: string;

  @IsOptional()
  @IsEnum(PlayerPositionEnum)
  readonly alternatePosition?: PlayerPositionEnum;

  @IsOptional()
  @IsNumber()
  readonly size?: number;

  @IsOptional()
  @IsNumber()
  readonly weight?: number;
}
