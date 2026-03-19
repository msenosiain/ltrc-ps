import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchEntity } from './schemas/match.entity';
import { MatchSchema } from './schemas/match.schema';
import { TournamentEntity } from '../tournaments/schemas/tournament.entity';
import { TournamentSchema } from '../tournaments/schemas/tournament.schema';
import { PlayerEntity } from '../players/schemas/player.entity';
import { PlayerSchema } from '../players/schemas/player.schema';
import { SquadsModule } from '../squads/squads.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MatchEntity.name, schema: MatchSchema, collection: 'matches' },
      { name: TournamentEntity.name, schema: TournamentSchema },
      { name: PlayerEntity.name, schema: PlayerSchema },
    ]),
    SquadsModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
