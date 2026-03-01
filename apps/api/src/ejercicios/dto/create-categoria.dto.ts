import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

class SubcategoriaDto {
  @IsString()
  id: string;

  @IsString()
  label: string;
}

export class CreateCategoriaDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsArray()
  subcategorias?: SubcategoriaDto[];
}
