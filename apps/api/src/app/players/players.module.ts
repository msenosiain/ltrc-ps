import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { PlayerEntity } from './schemas/player.entity';
import { PlayerSchema } from './schemas/player.schema';
import { GridFsModule } from '../shared/gridfs/gridfs.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PlayerEntity.name, schema: PlayerSchema, collection: 'players' },
    ]),
    GridFsModule,
    UsersModule,
  ],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService],
})
export class PlayersModule {}

