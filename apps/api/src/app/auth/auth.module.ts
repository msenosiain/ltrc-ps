import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';
import { AuthService } from './auth.service';
import { MailerService } from './mailer.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const secret =
          configService.get<string>('AUTH_JWT_SECRET') ||
          configService.get<string>('GOOGLE_AUTH_JWT_SECRET');

        if (!secret) {
          throw new Error(
            'Missing JWT secret: please set AUTH_JWT_SECRET (or GOOGLE_AUTH_JWT_SECRET)'
          );
        }

        return {
          secret,
          signOptions: { expiresIn: '1h' },
        };
      },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        transport: {
          host: config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
          port: config.get<number>('SMTP_PORT', 587),
          secure: config.get<string>('SMTP_SECURE', 'false') === 'true',
          auth: {
            user: config.get<string>('SMTP_USER'),
            pass: config.get<string>('SMTP_PASS'),
          },
        },
        defaults: {
          from: config.get<string>('SMTP_FROM', 'LTRC Campo <no-reply@lostordos.com.ar>'),
        },
      }),
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [GoogleStrategy, JwtStrategy, RefreshJwtStrategy, AuthService, MailerService],
})
export class AuthModule {}
