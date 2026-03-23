import { IsOptional, IsString, IsEnum, IsNumberString, ValidateNested } from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { ClothingSizesEnum } from '@ltrc-campo/shared-api-model';

class MyProfileAddressDto {
  @IsOptional()
  @IsNumberString()
  phoneNumber?: string;
}

class MyProfileClothingSizesDto {
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

export class UpdateMyProfileDto {
  @IsOptional()
  @Transform(({ value }) => {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(MyProfileAddressDto, obj);
  })
  @ValidateNested()
  @Type(() => MyProfileAddressDto)
  readonly address?: MyProfileAddressDto;

  @IsOptional()
  @Transform(({ value }) => {
    const obj = typeof value === 'string' ? JSON.parse(value) : value;
    return plainToInstance(MyProfileClothingSizesDto, obj);
  })
  @ValidateNested()
  @Type(() => MyProfileClothingSizesDto)
  readonly clothingSizes?: MyProfileClothingSizesDto;
}
