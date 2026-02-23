import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Joi from 'joi';
import { PlayersModule } from './players/players.module';
import { MongooseModule } from '@nestjs/mongoose';
import { GridFsModule } from './shared/gridfs/gridfs.module';
import { AuthModule } from './auth/auth.module';
import { join } from 'path';
import { UsersModule } from './users/users.module';
import { HealthController } from './health/health.controller';

export const configSchema = Joi.object({
  API_PORT: Joi.number().integer().default(3000),
  API_GLOBAL_PREFIX: Joi.string().default('/api/v1'),
  API_CORS_ALLOWED_ORIGINS: Joi.string().allow('').optional(),
  MONGODB_URI: Joi.string().required(),
  GOOGLE_AUTH_CLIENT_ID: Joi.string().allow('').optional(),
  GOOGLE_AUTH_CLIENT_SECRET: Joi.string().allow('').optional(),
  GOOGLE_AUTH_REDIRECT_URL: Joi.string().allow('').optional(),
  GOOGLE_AUTH_ALLOWED_DOMAIN: Joi.string().allow('').optional(),
  GOOGLE_AUTH_CALLBACK_URL: Joi.string().allow('').optional(),
  GOOGLE_AUTH_JWT_SECRET: Joi.string().allow('').optional(),
  GOOGLE_AUTH_REFRESH_JWT_SECRET: Joi.string().allow('').optional(),
  AUTH_JWT_SECRET: Joi.string().optional(),
  AUTH_REFRESH_JWT_SECRET: Joi.string().optional(),
});

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        '.env', // Archivo unificado en la raíz
        join(__dirname, '..', '..', '.env'), // Fallback para estructura de build
        join(process.cwd(), 'apps', 'api', '.env'), // Legacy path
      ],
      validationSchema: configSchema,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>(
          'MONGODB_URI',
          'mongodb://localhost:27017/ltrc-ps'
        ),
      }),
    }),
    GridFsModule,
    AuthModule,
    UsersModule,
    PlayersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
