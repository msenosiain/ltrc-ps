import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TrainingScheduleEntity } from './schedules/schemas/training-schedule.entity';
import { TrainingScheduleSchema } from './schedules/schemas/training-schedule.schema';
import { TrainingSessionEntity } from './sessions/schemas/training-session.entity';
import { TrainingSessionSchema } from './sessions/schemas/training-session.schema';
import { TrainingSchedulesController } from './schedules/training-schedules.controller';
import { TrainingSchedulesService } from './schedules/training-schedules.service';
import { TrainingSessionsController } from './sessions/training-sessions.controller';
import { TrainingSessionsService } from './sessions/training-sessions.service';
import { PlayerEntity } from '../players/schemas/player.entity';
import { PlayerSchema } from '../players/schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: TrainingScheduleEntity.name,
        schema: TrainingScheduleSchema,
        collection: 'training_schedules',
      },
      {
        name: TrainingSessionEntity.name,
        schema: TrainingSessionSchema,
        collection: 'training_sessions',
      },
      {
        name: PlayerEntity.name,
        schema: PlayerSchema,
        collection: 'players',
      },
    ]),
  ],
  controllers: [TrainingSchedulesController, TrainingSessionsController],
  providers: [TrainingSchedulesService, TrainingSessionsService],
  exports: [TrainingSchedulesService, TrainingSessionsService],
})
export class TrainingsModule {}
