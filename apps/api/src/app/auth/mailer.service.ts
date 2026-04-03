import { Injectable, Logger } from '@nestjs/common';
import { MailerService as NestMailerService } from '@nestjs-modules/mailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);

  constructor(
    private readonly mailer: NestMailerService,
    private readonly config: ConfigService,
  ) {}

  async sendPasswordReset(to: string, name: string, token: string): Promise<void> {
    const appUrl = this.config.get<string>(
      'APP_BASE_URL',
      'http://localhost:4200'
    );
    const link = `${appUrl}/auth/reset-password?token=${token}`;

    try {
      await this.mailer.sendMail({
        to,
        subject: 'Restablecer contraseña — LTRC Campo',
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>Hola ${name},</h2>
            <p>Recibimos una solicitud para restablecer tu contraseña en LTRC Campo.</p>
            <p style="margin: 24px 0;">
              <a href="${link}" style="background:#1976d2;color:#fff;padding:12px 24px;border-radius:4px;text-decoration:none;font-weight:bold;">
                Restablecer contraseña
              </a>
            </p>
            <p style="color:#666;font-size:14px;">Este enlace expira en 1 hora.</p>
            <p style="color:#666;font-size:14px;">Si no solicitaste esto, ignorá este email.</p>
          </div>
        `,
      });
    } catch (err) {
      this.logger.error(`Failed to send password reset email to ${to}`, err);
      throw err;
    }
  }
}
