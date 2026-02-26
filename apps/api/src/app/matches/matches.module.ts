import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchesController } from './matches.controller';
import { MatchesService } from './matches.service';
import { MatchEntity } from './schemas/match.entity';
import { MatchSchema } from './schemas/match.schema';
import { SquadsModule } from '../squads/squads.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MatchEntity.name, schema: MatchSchema, collection: 'matches' },
    ]),
    SquadsModule,
  ],
  controllers: [MatchesController],
  providers: [MatchesService],
  exports: [MatchesService],
})
export class MatchesModule {}
