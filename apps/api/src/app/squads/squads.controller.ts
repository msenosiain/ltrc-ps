import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CategoryEnum, RoleEnum } from '@ltrc-campo/shared-api-model';
import { Request } from 'express';
import { SquadsService } from './squads.service';
import { CreateSquadDto } from './dto/create-squad.dto';
import { UpdateSquadDto } from './dto/update-squad.dto';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('squads')
export class SquadsController {
  constructor(private readonly squadsService: SquadsService) {}

  @Get()
  async findAll(
    @Query('category') category?: CategoryEnum,
    @Req() req?: Request
  ) {
    return this.squadsService.findAll(category, (req as any)?.user);
  }

  @Post()
  @Roles(RoleEnum.MANAGER, RoleEnum.ADMIN)
  async create(@Body() dto: CreateSquadDto, @Req() req?: Request) {
    return this.squadsService.create(dto, (req as any)?.user);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.squadsService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSquadDto,
    @Req() req?: Request
  ) {
    return this.squadsService.update(id, dto, (req as any)?.user);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.squadsService.delete(id);
  }
}
