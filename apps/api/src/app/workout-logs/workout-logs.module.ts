import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutLogEntity } from './schemas/workout-log.entity';
import { WorkoutLogSchema } from './schemas/workout-log.schema';
import { WorkoutLogsController } from './workout-logs.controller';
import { WorkoutLogsService } from './workout-logs.service';
import { WorkoutEntity } from '../routines/schemas/workout.entity';
import { WorkoutSchema } from '../routines/schemas/workout.schema';
import { PlayerEntity } from '../players/schemas/player.entity';
import { PlayerSchema } from '../players/schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkoutLogEntity.name, schema: WorkoutLogSchema },
      { name: WorkoutEntity.name, schema: WorkoutSchema, collection: 'routines' },
      { name: PlayerEntity.name, schema: PlayerSchema },
    ]),
  ],
  controllers: [WorkoutLogsController],
  providers: [WorkoutLogsService],
})
export class WorkoutLogsModule {}
