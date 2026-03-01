import {
  Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { PartidosService } from './partidos.service';
import { CreatePartidoDto } from './dto/create-partido.dto';
import { PaginationDto } from '../shared/pagination-result.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RolEnum } from '@ltrc-ps/shared-api-model';

@UseGuards(JwtAuthGuard)
@Controller('partidos')
export class PartidosController {
  constructor(private readonly partidosService: PartidosService) {}

  @Get()
  findAll(
    @Query() pagination: PaginationDto,
    @Query('divisionId') divisionId?: string,
    @Query('equipoId') equipoId?: string,
    @Query('fecha') fecha?: string,
  ) {
    return this.partidosService.findAll(pagination, { divisionId, equipoId, fecha });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.partidosService.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN, RolEnum.ENTRENADOR)
  @Post()
  create(@Body() dto: CreatePartidoDto, @CurrentUser() user: any) {
    return this.partidosService.create(dto, user._id);
  }

  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN, RolEnum.ENTRENADOR)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreatePartidoDto>) {
    return this.partidosService.update(id, dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.partidosService.remove(id);
  }
}
