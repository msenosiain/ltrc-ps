import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SquadsController } from './squads.controller';
import { SquadsService } from './squads.service';
import { SquadEntity } from './schemas/squad.entity';
import { SquadSchema } from './schemas/squad.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SquadEntity.name, schema: SquadSchema, collection: 'squads' },
    ]),
  ],
  controllers: [SquadsController],
  providers: [SquadsService],
  exports: [SquadsService],
})
export class SquadsModule {}
