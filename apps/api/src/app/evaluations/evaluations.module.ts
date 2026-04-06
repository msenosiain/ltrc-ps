import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationsService } from './evaluations.service';
import { PlayerEvaluationEntity } from './schemas/player-evaluation.entity';
import { PlayerEvaluationSchema } from './schemas/player-evaluation.schema';
import { EvaluationSettingsEntity } from './schemas/evaluation-settings.entity';
import { EvaluationSettingsSchema } from './schemas/evaluation-settings.schema';
import { PlayerEntity } from '../players/schemas/player.entity';
import { PlayerSchema } from '../players/schemas/player.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: PlayerEvaluationEntity.name,
        schema: PlayerEvaluationSchema,
        collection: 'player_evaluations',
      },
      {
        name: EvaluationSettingsEntity.name,
        schema: EvaluationSettingsSchema,
        collection: 'evaluation_settings',
      },
      {
        name: PlayerEntity.name,
        schema: PlayerSchema,
        collection: 'players',
      },
    ]),
  ],
  controllers: [EvaluationsController],
  providers: [EvaluationsService],
  exports: [EvaluationsService],
})
export class EvaluationsModule {}
