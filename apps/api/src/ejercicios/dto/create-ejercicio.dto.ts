import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateEjercicioDto {
  @IsString()
  titulo: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsString()
  categoriaId: string;

  @IsString()
  subcategoriaId: string;

  @IsString()
  videoUrl: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  divisionIds?: string[] | null;
}
