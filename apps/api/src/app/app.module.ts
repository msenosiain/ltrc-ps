import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { PlayersModule } from '../players/players.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GridFsModule } from '../shared/gridfs/gridfs.module';

export const configSchema = Joi.object({
  API_MONGODB_URL: Joi.string().required(),
  API_MONGODB_DB: Joi.string().required(),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configSchema,
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('API_MONGODB_URL'),
        dbName: config.get<string>('API_MONGODB_DB'),
      }),
    }),
    GridFsModule,
    PlayersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
