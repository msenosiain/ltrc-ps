import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { MatchEntity } from '../matches/schemas/match.entity';
import { MatchSchema } from '../matches/schemas/match.schema';
import { TrainingSessionEntity } from '../trainings/sessions/schemas/training-session.entity';
import { TrainingSessionSchema } from '../trainings/sessions/schemas/training-session.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MatchEntity.name, schema: MatchSchema, collection: 'matches' },
      { name: TrainingSessionEntity.name, schema: TrainingSessionSchema, collection: 'training_sessions' },
    ]),
  ],
  controllers: [CalendarController],
  providers: [CalendarService],
})
export class CalendarModule {}
