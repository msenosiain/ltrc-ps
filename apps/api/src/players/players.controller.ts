import { Body, Controller, Get, Post } from '@nestjs/common';
import { Player } from './interfaces/player.interface';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayersService } from './players.service';

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
}
