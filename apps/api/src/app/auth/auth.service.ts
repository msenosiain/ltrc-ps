import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/schemas/user.schema';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService
  ) {}

  async register(userData: Partial<User>) {
    const existingUser = await this.usersService.findOneByEmail(
      userData.email!
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 10);
    }

    const user = await this.usersService.create(userData);
    return this.generateJwt(user);
  }

  async login(email: string, pass: string) {
    const user = await this.usersService.findOneByEmail(email, true);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Cuenta pendiente de activación: fue creada por el admin sin contraseña
    if (!user.password) {
      throw new HttpException(
        {
          message: 'Account pending activation',
          code: 'ACCOUNT_PENDING_ACTIVATION',
        },
        HttpStatus.FORBIDDEN
      );
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateJwt(user);
  }

  async activateAccount(email: string, password: string) {
    const user = await this.usersService.findOneByEmail(email, true);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.password) {
      throw new BadRequestException('Account already activated');
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return this.generateJwt(user);
  }

  async generateJwt(user: User) {
    const payload = this.buildJWTPayload(user);
    const refreshSecret = this.configService.get<string>(
      'AUTH_REFRESH_JWT_SECRET',
      this.configService.get<string>(
        'GOOGLE_AUTH_REFRESH_JWT_SECRET',
        'super-secret-key'
      )
    );

    return {
      access_token: this.jwtService.sign(payload),
      refresh_token: this.jwtService.sign(payload, {
        secret: refreshSecret,
        expiresIn: '1d',
      }),
    };
  }

  refreshToken(user: User) {
    const payload = this.buildJWTPayload(user);

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  private buildJWTPayload(user: User) {
    return {
      sub: (user as any)._id?.toString() || user.googleId,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      roles: user.roles,
      hasPassword: !!user.password,
    };
  }
}
