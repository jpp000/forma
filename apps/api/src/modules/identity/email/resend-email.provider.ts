import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { Resend } from 'resend';
import type { EmailProvider } from './email-provider.interface';

@Injectable()
export class ResendEmailProvider implements EmailProvider {
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('RESEND_API_KEY is required when EMAIL_PROVIDER=resend');
    }
    this.resend = new Resend(apiKey);
    this.from = process.env.RESEND_FROM ?? 'Forma <onboarding@forma.app>';
  }

  async sendOtp(to: string, code: string, locale: string): Promise<void> {
    const subject =
      locale === 'en' ? 'Your Forma verification code' : 'Seu código Forma';
    const text =
      locale === 'en'
        ? `Your verification code is: ${code}`
        : `Seu código de verificação é: ${code}`;

    const { error } = await this.resend.emails.send({
      from: this.from,
      to,
      subject,
      text,
    });

    if (error) {
      throw new ServiceUnavailableException('errors.email_delivery_failed');
    }
  }
}
