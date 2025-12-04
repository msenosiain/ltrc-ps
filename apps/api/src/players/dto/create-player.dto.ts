import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { PlayerPositionEnum } from '../interfaces/player-position.enum';
import { Transform, Type } from 'class-transformer';
import { parse } from 'date-fns';
import { DATE_FORMAT } from '../../shared/constants';
import { ClothingSizesEnum } from '../interfaces/clothing-sizes.enum';

export class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsNumberString()
  phoneNumber: string;
}

export class ClothingSizesDto {
  @IsOptional()
  @IsEnum(ClothingSizesEnum)
  jersey?: ClothingSizesEnum;

  @IsOptional()
  @IsEnum(ClothingSizesEnum)
  shorts?: ClothingSizesEnum;

  @IsOptional()
  @IsEnum(ClothingSizesEnum)
  sweater?: ClothingSizesEnum;

  @IsOptional()
  @IsEnum(ClothingSizesEnum)
  pants?: ClothingSizesEnum;
}


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
  @Transform(({ value }) => {
    const parsedDate = parse(value, DATE_FORMAT, new Date());
    return parsedDate instanceof Date && !isNaN(parsedDate.getTime())
      ? parsedDate
      : null;
  })
  @IsDate({
    message: `$property must be a Date instance with format ${DATE_FORMAT}`,
  })
  readonly birthDate: Date;

  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsEnum(PlayerPositionEnum)
  readonly position: PlayerPositionEnum;

  @IsOptional()
  @IsEnum(PlayerPositionEnum)
  readonly alternatePosition?: PlayerPositionEnum;

  @IsOptional()
  @IsNumber()
  readonly size?: number;

  @IsOptional()
  @IsNumber()
  readonly weight?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  readonly address?: AddressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => ClothingSizesDto)
  readonly clothingSizes?: ClothingSizesDto;
}
