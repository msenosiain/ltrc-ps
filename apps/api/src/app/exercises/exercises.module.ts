import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExerciseEntity } from './schemas/exercise.entity';
import { ExerciseSchema } from './schemas/exercise.schema';
import { ExercisesController } from './exercises.controller';
import { ExercisesService } from './exercises.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ExerciseEntity.name, schema: ExerciseSchema, collection: 'exercises' },
    ]),
  ],
  controllers: [ExercisesController],
  providers: [ExercisesService],
  exports: [ExercisesService],
})
export class ExercisesModule {}
