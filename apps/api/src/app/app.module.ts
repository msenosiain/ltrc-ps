import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { PlayersModule } from '../players/players.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GridFsModule } from '../shared/gridfs/gridfs.module';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { DivisionesModule } from '../divisiones/divisiones.module';
import { EquiposModule } from '../equipos/equipos.module';
import { EjerciciosModule } from '../ejercicios/ejercicios.module';
import { PartidosModule } from '../partidos/partidos.module';
import { SeedModule } from '../seed/seed.module';

export const configSchema = Joi.object({
  API_MONGODB_URL: Joi.string().required(),
  API_MONGODB_DB: Joi.string().required(),
  JWT_SECRET: Joi.string().required(),
  JWT_EXPIRES_IN: Joi.string().default('1h'),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  ADMIN_EMAIL: Joi.string().default('admin@ltrc.com'),
  ADMIN_PASSWORD: Joi.string().default('Admin1234!'),
  PORT: Joi.number().default(3000),
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
    AuthModule,
    UsersModule,
    DivisionesModule,
    EquiposModule,
    EjerciciosModule,
    PartidosModule,
    SeedModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
