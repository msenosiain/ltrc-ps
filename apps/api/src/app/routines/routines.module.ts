import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RoutineEntity } from './schemas/routine.entity';
import { RoutineSchema } from './schemas/routine.schema';
import { RoutinesController } from './routines.controller';
import { RoutinesService } from './routines.service';
import { ExerciseEntity } from '../exercises/schemas/exercise.entity';
import { ExerciseSchema } from '../exercises/schemas/exercise.schema';
import { PlayerEntity } from '../players/schemas/player.entity';
import { PlayerSchema } from '../players/schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RoutineEntity.name, schema: RoutineSchema, collection: 'routines' },
      { name: ExerciseEntity.name, schema: ExerciseSchema, collection: 'exercises' },
      { name: PlayerEntity.name, schema: PlayerSchema, collection: 'players' },
    ]),
  ],
  controllers: [RoutinesController],
  providers: [RoutinesService],
  exports: [RoutinesService],
})
export class RoutinesModule {}
