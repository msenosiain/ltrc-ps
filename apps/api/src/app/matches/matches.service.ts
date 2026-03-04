import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MatchEntity } from './schemas/match.entity';
import { PaginationDto } from '../shared/pagination.dto';
import { PaginatedResponse, Role } from '@ltrc-ps/shared-api-model';
import { MatchFiltersDto } from './match-filter.dto';
import { CreateMatchDto } from './dto/create-match.dto';
import { UpdateMatchDto } from './dto/update-match.dto';
import { SquadsService } from '../squads/squads.service';
import { User } from '../users/schemas/user.schema';

const POPULATE_FIELDS = [
  'tournament',
  { path: 'squad.player' },
  { path: 'videos.targetPlayers' },
];

@Injectable()
export class MatchesService {
  constructor(
    @InjectModel(MatchEntity.name)
    private readonly matchModel: Model<MatchEntity>,
    private readonly squadsService: SquadsService
  ) {}

  async create(dto: CreateMatchDto) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this.matchModel.create(dto as any);
  }

  async update(id: string, dto: UpdateMatchDto) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');

    Object.assign(match, dto);
    return match.save();
  }

  async updateSquad(
    id: string,
    squad: { shirtNumber: number; playerId: string }[]
  ) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');

    match.set(
      'squad',
      squad.map(({ shirtNumber, playerId }) => ({
        shirtNumber,
        player: playerId,
      }))
    );
    return this.stripOrphanedSquad(
      await (await match.save()).populate(POPULATE_FIELDS)
    );
  }

  async findPaginated(
    pagination: PaginationDto<MatchFiltersDto>,
    caller?: User
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

    if (filters.sport) {
      queryFilters['sport'] = filters.sport;
    }

    if (filters.category) {
      queryFilters['category'] = filters.category;
    }

    if (filters.fromDate || filters.toDate) {
      const dateFilter: Record<string, Date> = {};
      if (filters.fromDate) dateFilter['$gte'] = new Date(filters.fromDate);
      if (filters.toDate) dateFilter['$lte'] = new Date(filters.toDate);
      queryFilters['date'] = dateFilter;
    }

    // Coach server-side filter override
    if (caller?.roles?.includes(Role.COACH)) {
      if (caller.sports?.length) queryFilters['sport'] = { $in: caller.sports };
      if (caller.categories?.length)
        queryFilters['category'] = { $in: caller.categories };
    }

    const sort: Record<string, 1 | -1> = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    } else {
      sort['date'] = 1;
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

  async getFieldOptions() {
    const [opponents, venues, divisions] = await Promise.all([
      this.matchModel.distinct('opponent'),
      this.matchModel.distinct('venue'),
      this.matchModel.distinct('division').then((vals) => vals.filter(Boolean)),
    ]);
    return { opponents, venues, divisions };
  }

  async findOne(id: string) {
    const match = await this.matchModel.findById(id).populate(POPULATE_FIELDS);
    if (!match) throw new NotFoundException('Match not found');
    return this.stripOrphanedSquad(match);
  }

  private stripOrphanedSquad(match: MatchEntity) {
    match.set(
      'squad',
      (match.squad ?? []).filter((e) => e.player != null)
    );
    return match;
  }

  async applySquadTemplate(id: string, squadId: string) {
    const [match, squadEntries] = await Promise.all([
      this.matchModel.findById(id),
      this.squadsService.getPlayers(squadId),
    ]);
    if (!match) throw new NotFoundException('Match not found');

    match.set(
      'squad',
      squadEntries.map((e) => ({
        shirtNumber: e.shirtNumber,
        player: e.player,
      }))
    );
    return this.stripOrphanedSquad(
      await (await match.save()).populate(POPULATE_FIELDS)
    );
  }

  async delete(id: string) {
    const match = await this.matchModel.findById(id);
    if (!match) throw new NotFoundException('Match not found');
    return match.deleteOne();
  }
}
