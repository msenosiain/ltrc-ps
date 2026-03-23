import { IsArray, IsIn, IsMongoId, IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { VideoVisibility } from '@ltrc-campo/shared-api-model';

export class ManageVideoDto {
  @IsUrl({ require_protocol: true })
  url!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsIn(['all', 'staff', 'players'])
  visibility!: VideoVisibility;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  targetPlayers?: string[];
}
