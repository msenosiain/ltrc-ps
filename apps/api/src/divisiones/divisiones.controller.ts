import {
  Body, Controller, Delete, Get, Param, Patch, Post, UseGuards,
} from '@nestjs/common';
import { DivisionesService, CreateDivisionDto } from './divisiones.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolEnum } from '@ltrc-ps/shared-api-model';

@Controller('divisiones')
export class DivisionesController {
  constructor(private readonly divisionesService: DivisionesService) {}

  @Get()
  findAll() {
    return this.divisionesService.findAll();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMIN)
  @Post()
  create(@Body() dto: CreateDivisionDto) {
    return this.divisionesService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateDivisionDto>) {
    return this.divisionesService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RolEnum.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.divisionesService.remove(id);
  }
}
