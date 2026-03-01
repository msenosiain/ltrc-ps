import {
  Body, Controller, Get, Param, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { EquiposService, CreateEquipoDto } from './equipos.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolEnum } from '@ltrc-ps/shared-api-model';

@UseGuards(JwtAuthGuard)
@Controller('equipos')
export class EquiposController {
  constructor(private readonly equiposService: EquiposService) {}

  @Get()
  findAll(@Query('divisionId') divisionId?: string) {
    return this.equiposService.findAll(divisionId);
  }

  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN)
  @Post()
  create(@Body() dto: CreateEquipoDto) {
    return this.equiposService.create(dto);
  }

  @UseGuards(RolesGuard)
  @Roles(RolEnum.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: Partial<CreateEquipoDto>) {
    return this.equiposService.update(id, dto);
  }
}
