import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { playersProviders } from './players.provider';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  imports: [DatabaseModule],
  controllers: [PlayersController],
  providers: [PlayersService, ...playersProviders],
})
export class PlayersModule {}
