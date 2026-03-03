import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CategoryEnum } from '@ltrc-ps/shared-api-model';
import { SquadEntity } from './schemas/squad.entity';
import { CreateSquadDto } from './dto/create-squad.dto';
import { UpdateSquadDto } from './dto/update-squad.dto';

const POPULATE_PLAYERS = [{ path: 'players.player' }];

@Injectable()
export class SquadsService {
  constructor(
    @InjectModel(SquadEntity.name)
    private readonly squadModel: Model<SquadEntity>
  ) {}

  async create(dto: CreateSquadDto) {
    const squad = await this.squadModel.create({
      name: dto.name,
      category: dto.category,
      players: dto.players.map(({ shirtNumber, playerId }) => ({
        shirtNumber,
        player: playerId,
      })),
    });
    return squad!.populate(POPULATE_PLAYERS);
  }

  async findAll(category?: CategoryEnum) {
    const filter = category ? { category } : {};
    return this.squadModel.find(filter).sort({ name: 1 }).populate(POPULATE_PLAYERS).exec();
  }

  async findOne(id: string) {
    const squad = await this.squadModel.findById(id).populate(POPULATE_PLAYERS);
    if (!squad) throw new NotFoundException('Squad not found');
    return squad;
  }

  async update(id: string, dto: UpdateSquadDto) {
    const squad = await this.squadModel.findById(id);
    if (!squad) throw new NotFoundException('Squad not found');

    if (dto.name) squad.name = dto.name;
    if (dto.category !== undefined) squad.category = dto.category;
    if (dto.players) {
      squad.set(
        'players',
        dto.players.map(({ shirtNumber, playerId }) => ({ shirtNumber, player: playerId }))
      );
    }

    return (await squad.save()).populate(POPULATE_PLAYERS);
  }

  async delete(id: string) {
    const squad = await this.squadModel.findById(id);
    if (!squad) throw new NotFoundException('Squad not found');
    return squad.deleteOne();
  }

  async getPlayers(id: string) {
    const squad = await this.findOne(id);
    return squad.players;
  }
}
