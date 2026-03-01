import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DivisionesController } from './divisiones.controller';
import { DivisionesService } from './divisiones.service';
import { Division, DivisionSchema } from './schemas/division.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Division.name, schema: DivisionSchema, collection: 'divisiones' }]),
  ],
  controllers: [DivisionesController],
  providers: [DivisionesService],
  exports: [DivisionesService],
})
export class DivisionesModule {}
