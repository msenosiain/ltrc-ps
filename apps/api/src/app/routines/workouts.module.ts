import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WorkoutEntity } from './schemas/workout.entity';
import { WorkoutSchema } from './schemas/workout.schema';
import { WorkoutsController } from './workouts.controller';
import { WorkoutsService } from './workouts.service';
import { ExerciseEntity } from '../exercises/schemas/exercise.entity';
import { ExerciseSchema } from '../exercises/schemas/exercise.schema';
import { PlayerEntity } from '../players/schemas/player.entity';
import { PlayerSchema } from '../players/schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WorkoutEntity.name, schema: WorkoutSchema, collection: 'routines' },
      { name: ExerciseEntity.name, schema: ExerciseSchema, collection: 'exercises' },
      { name: PlayerEntity.name, schema: PlayerSchema, collection: 'players' },
    ]),
  ],
  controllers: [WorkoutsController],
  providers: [WorkoutsService],
  exports: [WorkoutsService],
})
export class WorkoutsModule {}
