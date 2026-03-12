import {
  IsBoolean,
  IsDate,
  IsEmail,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsNumberString,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

import { Transform, Type, plainToInstance } from 'class-transformer';
import {
  CategoryEnum,
  ClothingSizesEnum,
  HockeyBranchEnum,
  HockeyPositions,
  parseDate,
  PlayerPosition,
  RugbyPositions,
  SportEnum,
} from '@ltrc-ps/shared-api-model';

export class AddressDto {
  @IsOptional()
  @IsString()
  street?: string;

  @IsOptional()
  @IsString()
  number?: string;

  @IsOptional()
  @IsString()
  floorApartment?: string;

  @IsOptional()
  @IsString()
  neighborhood?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsNumberString()
  phoneNumber!: string;
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

export class MedicalDataDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  height?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  weight?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  torgIndex?: number;

  @IsOptional()
  @IsString()
  healthInsurance?: string;
}

export class ParentContactDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;
}

export class CreatePlayerDto {
  @IsNotEmpty()
  @IsString()
  readonly name!: string;

  @IsOptional()
  @IsNumberString()
  readonly memberNumber?: string;

  @IsOptional()
  @IsString()
  readonly nickName?: string;

  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.replace(/\D/g, '') : value
  )
  readonly idNumber!: string;

  @IsNotEmpty()
  @Transform(({ value }) => parseDate(value))
  @IsDate({ message: '$property must be a valid date (dd/MM/yyyy)' })
  readonly birthDate!: Date;

  @IsNotEmpty()
  @IsEmail()
  readonly email!: string;

  @IsNotEmpty()
  @IsEnum(SportEnum)
  readonly sport!: SportEnum;

  @IsNotEmpty()
  @IsEnum(CategoryEnum)
  readonly category!: CategoryEnum;

  @IsOptional()
  @IsEnum(HockeyBranchEnum)
  readonly branch?: HockeyBranchEnum;

  @IsOptional()
  @IsIn([
    ...new Set([
      ...Object.values(RugbyPositions),
      ...Object.values(HockeyPositions),
    ]),
  ])
  readonly position?: PlayerPosition;

  @IsOptional()
  @IsIn([
    ...new Set([
      ...Object.values(RugbyPositions),
      ...Object.values(HockeyPositions),
    ]),
  ])
  readonly alternatePosition?: PlayerPosition;

  @IsOptional()
  @Transform(({ value }) => {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(AddressDto, obj);
  })
  @ValidateNested()
  readonly address?: AddressDto;

  @IsOptional()
  @Transform(({ value }) => {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(ClothingSizesDto, obj);
  })
  @ValidateNested()
  readonly clothingSizes?: ClothingSizesDto;

  @IsOptional()
  @Transform(({ value }) => {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(MedicalDataDto, obj);
  })
  @ValidateNested()
  readonly medicalData?: MedicalDataDto;

  @IsOptional()
  @Transform(({ value }) => {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(ParentContactDto, obj);
  })
  @ValidateNested()
  readonly parentContact?: ParentContactDto;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  readonly createUser?: boolean;
}
