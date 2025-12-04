import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Player } from './interfaces/player.interface';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayersService } from './players.service';
import { FindByIdParams } from '../shared/find-by-id.params';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  async create(@Body() createPlayerDto: CreatePlayerDto): Promise<Player> {
    return await this.playersService.create(createPlayerDto);
  }

  @Get()
  async findAll(): Promise<Player[]> {
    return await this.playersService.findAll();
  }

  @Get(':id')
  async getById(@Param() params: FindByIdParams): Promise<Player> {
    return await this.playersService.getById(params.id);
  }
}
