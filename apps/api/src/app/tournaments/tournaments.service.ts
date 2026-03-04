import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TournamentEntity } from './schemas/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import { TournamentFilterDto } from './dto/tournament-filter.dto';
import { PaginatedResponse, Role, SortOrder } from '@ltrc-ps/shared-api-model';
import { User } from '../users/schemas/user.schema';
import { PaginationDto } from '../shared/pagination.dto';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(TournamentEntity.name)
    private readonly tournamentModel: Model<TournamentEntity>
  ) {}

  async create(dto: CreateTournamentDto) {
    return this.tournamentModel.create(dto);
  }

  async findPaginated(
    pagination: PaginationDto<TournamentFilterDto>,
    caller?: User
  ): Promise<PaginatedResponse<unknown>> {
    const { page, size, filters = {}, sortBy, sortOrder = SortOrder.DESC } =
      pagination;
    const skip = (page - 1) * size;
    const query: Record<string, unknown> = {};

    if (filters.searchTerm) {
      const regex = new RegExp(filters.searchTerm, 'i');
      query['$or'] = [{ name: regex }, { season: regex }];
    }
    if (filters.sport) query['sport'] = filters.sport;

    // Coach server-side filter override
    if (caller?.roles?.includes(Role.COACH)) {
      if (caller.sports?.length) query['sport'] = { $in: caller.sports };
    }

    const sort: Record<string, 1 | -1> = sortBy
      ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
      : { season: -1 };

    const [items, total] = await Promise.all([
      this.tournamentModel.find(query).sort(sort).skip(skip).limit(size).exec(),
      this.tournamentModel.countDocuments(query),
    ]);

    return { items, total, page, size };
  }

  async findOne(id: string) {
    const tournament = await this.tournamentModel.findById(id);
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async update(id: string, dto: UpdateTournamentDto) {
    const tournament = await this.tournamentModel.findById(id);
    if (!tournament) throw new NotFoundException('Tournament not found');

    Object.assign(tournament, dto);
    return tournament.save();
  }

  async delete(id: string) {
    const tournament = await this.tournamentModel.findById(id);
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament.deleteOne();
  }
}
