import {
  Controller,
  Post,
  Patch,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

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
  async findPaginated(@Query() pagination: PaginationDto<MatchFiltersDto>) {
    return this.matchesService.findPaginated(pagination);
  }

  @Post()
  async create(@Body() dto: CreateMatchDto) {
    return this.matchesService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateMatchDto) {
    return this.matchesService.update(id, dto);
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
