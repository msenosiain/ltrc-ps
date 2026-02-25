import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MatchEntity } from './schemas/match.entity';
import { PaginationDto } from '../shared/pagination.dto';
import { PaginatedResponse } from '@ltrc-ps/shared-api-model';
import { MatchFiltersDto } from './match-filter.dto';
import { CreateMatchDto } from './dto/create-match.dto';

const POPULATE_FIELDS = [
  'tournament',
  'selectedPlayers',
  { path: 'videos.targetPlayers' },
];

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(MatchEntity.name)
    private readonly matchModel: Model<MatchEntity>
  ) {}

  async create(dto: CreateMatchDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.matchModel.create(dto as any);
  }

  async update(id: string, dto: Partial<CreateMatchDto>) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');

    Object.assign(match, dto);
    return match.save();
  }

  async updatePlayers(id: string, playerIds: string[]) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');

    match.set('selectedPlayers', playerIds);
    return (await match.save()).populate(POPULATE_FIELDS);
  }

  async findPaginated(
    pagination: PaginationDto<MatchFiltersDto>
  ): Promise<PaginatedResponse<unknown>> {
    const { page, size, filters = {}, sortBy, sortOrder = 'asc' } = pagination;
    const skip = (page - 1) * size;

    const queryFilters: Record<string, unknown> = {};

    if (filters.status) {
      queryFilters['status'] = filters.status;
    }

    if (filters.type) {
      queryFilters['type'] = filters.type;
    }

    if (filters.tournament) {
      queryFilters['tournament'] = filters.tournament;
    }

    if (filters.fromDate || filters.toDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.fromDate) dateFilter['$gte'] = new Date(filters.fromDate);
      if (filters.toDate) dateFilter['$lte'] = new Date(filters.toDate);
      queryFilters['date'] = dateFilter;
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['date'] = -1;
    }

    const [items, total] = await Promise.all([
      this.matchModel
        .find(queryFilters)
        .skip(skip)
        .limit(size)
        .sort(sort)
        .populate(POPULATE_FIELDS)
        .exec(),
      this.matchModel.countDocuments(queryFilters).exec(),
    ]);

    return { items, total, page, size };
  }

  async findOne(id: string) {
    const match = await this.matchModel
      .findById(id)
      .populate(POPULATE_FIELDS);
    if (!match) throw new NotFoundException('Match not found');
    return match;
  }

  async delete(id: string) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');
    return match.deleteOne();
  }
}
