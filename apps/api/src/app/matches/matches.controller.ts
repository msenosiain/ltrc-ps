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
import { UpdateMatchPlayersDto } from './dto/update-players.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
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
  async update(
    @Param('id') id: string,
    @Body() dto: Partial<CreateMatchDto>
  ) {
    return this.matchesService.update(id, dto);
  }

  @Patch(':id/players')
  async updatePlayers(
    @Param('id') id: string,
    @Body() dto: UpdateMatchPlayersDto
  ) {
    return this.matchesService.updatePlayers(id, dto.playerIds);
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
