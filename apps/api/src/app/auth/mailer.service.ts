import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: config.get<number>('SMTP_PORT', 587),
      secure: config.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: config.get<string>('SMTP_USER'),
        pass: config.get<string>('SMTP_PASS'),
      },
    });
  }

  async sendPasswordReset(to: string, name: string, token: string): Promise<void> {
    const appUrl = this.config.get<string>('APP_URL', 'http://localhost:4200');
    const from = this.config.get<string>('SMTP_FROM', 'LTRC Campo <no-reply@lostordos.com.ar>');
    const link = `${appUrl}/auth/reset-password?token=${token}`;

    try {
      await this.transporter.sendMail({
        from,
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
