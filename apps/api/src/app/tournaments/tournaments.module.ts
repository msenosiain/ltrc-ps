import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';
import { TournamentEntity } from './schemas/tournament.entity';
import { TournamentSchema } from './schemas/tournament.schema';
import { GridFsModule } from '../shared/gridfs/gridfs.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TournamentEntity.name,
        schema: TournamentSchema,
        collection: 'tournaments',
      },
    ]),
    GridFsModule,
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService],
})
export class TournamentsModule {}
