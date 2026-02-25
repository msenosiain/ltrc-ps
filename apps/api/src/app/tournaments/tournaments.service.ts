import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TournamentEntity } from './schemas/tournament.entity';
import { CreateTournamentDto } from './dto/create-tournament.dto';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(TournamentEntity.name)
    private readonly tournamentModel: Model<TournamentEntity>
  ) {}

  async create(dto: CreateTournamentDto) {
    return this.tournamentModel.create(dto);
  }

  async findAll() {
    return this.tournamentModel.find().sort({ name: 1 }).exec();
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
