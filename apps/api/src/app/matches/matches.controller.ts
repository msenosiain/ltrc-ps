import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';

import { MatchesService } from './matches.service';
import { PaginationDto } from '../shared/pagination.dto';
import { MatchFiltersDto } from './match-filter.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { UpdateMatchSquadDto } from './dto/update-players.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('matches')
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async findPaginated(
    @Query() pagination: PaginationDto<MatchFiltersDto>,
    @Req() req: Request
  ) {
    return this.matchesService.findPaginated(pagination, (req as any).user);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateMatchDto, @Req() req: Request) {
    return this.matchesService.create(dto, (req as any).user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: string, @Body() dto: UpdateMatchDto, @Req() req: Request) {
    return this.matchesService.update(id, dto, (req as any).user);
  }

  @Patch(':id/squad')
  async updateSquad(@Param('id') id: string, @Body() dto: UpdateMatchSquadDto) {
    return this.matchesService.updateSquad(id, dto.squad);
  }

  @Post(':id/squad/from/:squadId')
  async applySquadTemplate(
    @Param('id') id: string,
    @Param('squadId') squadId: string
  ) {
    return this.matchesService.applySquadTemplate(id, squadId);
  }

  @Get('field-options')
  async getFieldOptions() {
    return this.matchesService.getFieldOptions();
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.matchesService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.matchesService.delete(id);
  }
}
