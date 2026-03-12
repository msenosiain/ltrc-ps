import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BranchAssignmentsController } from './branch-assignments.controller';
import { BranchAssignmentsService } from './branch-assignments.service';
import { BranchAssignmentEntity } from './schemas/branch-assignment.entity';
import { BranchAssignmentSchema } from './schemas/branch-assignment.schema';
import { PlayerEntity } from '../players/schemas/player.entity';
import { PlayerSchema } from '../players/schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: BranchAssignmentEntity.name,
        schema: BranchAssignmentSchema,
        collection: 'branch-assignments',
      },
      {
        name: PlayerEntity.name,
        schema: PlayerSchema,
      },
    ]),
  ],
  controllers: [BranchAssignmentsController],
  providers: [BranchAssignmentsService],
  exports: [BranchAssignmentsService],
})
export class BranchAssignmentsModule {}
