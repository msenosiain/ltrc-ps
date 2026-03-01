import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { EjerciciosService } from './ejercicios.service';
import { CreateEjercicioDto } from './dto/create-ejercicio.dto';
import { CreateCategoriaDto } from './dto/create-categoria.dto';
import { PaginationDto } from '../shared/pagination-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolEnum } from '@ltrc-ps/shared-api-model';

@UseGuards(JwtAuthGuard)
@Controller('ejercicios')
export class EjerciciosController {
  constructor(private readonly ejerciciosService: EjerciciosService) {}

  // ─── Categorías ────────────────────────────────────────────────────────────

  @Get('categorias')
  findAllCategorias() {
    return this.ejerciciosService.findAllCategorias();
  }

  @Get('categorias/:id')
  findCategoria(@Param('id') id: string) {
    return this.ejerciciosService.findCategoria(id);
  }

  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN, RolEnum.ENTRENADOR)
  @Post('categorias')
  createCategoria(@Body() dto: CreateCategoriaDto) {
    return this.ejerciciosService.createCategoria(dto);
  }

  // ─── Ejercicios ────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('categoriaId') categoriaId?: string,
    @Query('subcategoriaId') subcategoriaId?: string,
    @Query('divisionId') divisionId?: string,
  ) {
    return this.ejerciciosService.findAll(pagination, { categoriaId, subcategoriaId, divisionId });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ejerciciosService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN, RolEnum.ENTRENADOR)
  @Post()
  create(@Body() dto: CreateEjercicioDto, @CurrentUser() user: any) {
    return this.ejerciciosService.create(dto, user._id);
  }

  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN, RolEnum.ENTRENADOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateEjercicioDto>) {
    return this.ejerciciosService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ejerciciosService.remove(id);
  }
}
