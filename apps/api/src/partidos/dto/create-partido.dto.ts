import { IsArray, IsDateString, IsOptional, IsString } from 'class-validator';

export class CreatePartidoDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  divisionId: string;

  @IsString()
  equipoId: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsString()
  rival?: string;

  @IsOptional()
  @IsString()
  resultado?: string;

  @IsString()
  videoUrl: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
