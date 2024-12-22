import { Inject, Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Player } from './interfaces/player.interface';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PLAYER_MODEL } from '../shared/constants';
import { plainToClass } from 'class-transformer';

@Injectable()
export class PlayersService {
  constructor(
    @Inject(PLAYER_MODEL) private readonly playerModel: Model<Player>
  ) {}

  async create(createPlayerDto: CreatePlayerDto) {

    return await this.playerModel.create(createPlayerDto);
  }

  async findAll(): Promise<Player[]> {
    return await this.playerModel.find().exec();
  }
}
