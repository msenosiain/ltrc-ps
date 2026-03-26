import {
  Controller,
  Get,
  Logger,
  Post,
  Req,
  Res,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RefreshJwtAuthGuard } from './guards/refresh-jwt-auth.guard';
import { User } from '../users/schemas/user.schema';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private configService: ConfigService
  ) {}

  @Post('login')
  async login(@Body() body: { email: string; pass: string }) {
    return this.authService.login(body.email, body.pass);
  }

  @Post('register')
  async register(@Body() userData: Partial<User>) {
    return this.authService.register(userData);
  }

  @Post('activate')
  async activate(@Body() body: { email: string; password: string }) {
    return this.authService.activateAccount(body.email, body.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    this.logger.log(`POST /auth/forgot-password for: ${body.email}`);
    await this.authService.forgotPassword(body.email);
    return { message: 'Si el email existe, recibirás un enlace para restablecer tu contraseña.' };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; password: string }) {
    await this.authService.resetPassword(body.token, body.password);
    return { message: 'Contraseña restablecida correctamente.' };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(): Promise<void> {
    // Passport handles the redirect flow; method intentionally no-op
    return;
  }

  @Get('google/redirect')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    const user = (req as unknown as { user?: User }).user;
    const token = await this.authService.generateJwt(user as User);
    const callbackUrl = this.configService.get<string>(
      'GOOGLE_AUTH_CALLBACK_URL',
      'http://localhost:4200/auth/callback'
    );
    res.redirect(
      `${callbackUrl}?access_token=${token.access_token}&refresh_token=${token.refresh_token}`
    );
  }

  @UseGuards(RefreshJwtAuthGuard)
  @Post('refresh')
  async refreshTokens(@Req() req: Request) {
    const user = (req as unknown as { user?: User }).user;
    return this.authService.refreshToken(user as User);
  }
}
