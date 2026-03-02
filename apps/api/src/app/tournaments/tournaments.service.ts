import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TournamentEntity } from './schemas/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { TournamentFilterDto } from './dto/tournament-filter.dto';
import { SortOrder } from '@ltrc-ps/shared-api-model';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(TournamentEntity.name)
    private readonly tournamentModel: Model<TournamentEntity>
  ) {}

  async create(dto: CreateTournamentDto) {
    return this.tournamentModel.create(dto);
  }

  async findAll(filters: TournamentFilterDto = {}) {
    const { searchTerm, sport, sortBy, sortOrder = SortOrder.DESC } = filters;
    const query: Record<string, unknown> = {};

    if (searchTerm) {
      const regex = new RegExp(searchTerm, 'i');
      query['$or'] = [{ name: regex }, { season: regex }];
    }
    if (sport) query['sport'] = sport;

    const sort: Record<string, 1 | -1> = sortBy
      ? { [sortBy]: sortOrder === 'asc' ? 1 : -1 }
      : { season: -1 };

    return this.tournamentModel.find(query).sort(sort).exec();
  }

  async findOne(id: string) {
    const tournament = await this.tournamentModel.findById(id);
    if (!tournament) throw new NotFoundException('Tournament not found');
    return tournament;
  }

  async update(id: string, dto: Partial<CreateTournamentDto>) {
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
