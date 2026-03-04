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

import { TournamentsService } from './tournaments.service';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentFilterDto } from './dto/tournament-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PaginationDto } from '../shared/pagination.dto';

// @UseGuards(JwtAuthGuard)
@Controller('tournaments')
export class TournamentsController {
  constructor(private readonly tournamentsService: TournamentsService) {}

  @Get()
  async findAll(
    @Query() query: PaginationDto<TournamentFilterDto>,
    @Req() req: Request
  ) {
    return this.tournamentsService.findPaginated(query, (req as any).user);
  }

  @Post()
  async create(@Body() dto: CreateTournamentDto) {
    return this.tournamentsService.create(dto);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateTournamentDto) {
    return this.tournamentsService.update(id, dto);
  }

  @Get(':id')
  async getOne(@Param('id') id: string) {
    return this.tournamentsService.findOne(id);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.tournamentsService.delete(id);
  }
}
