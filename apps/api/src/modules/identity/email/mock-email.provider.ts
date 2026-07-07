import { Injectable } from '@nestjs/common';
import type { EmailProvider } from './email-provider.interface';

@Injectable()
export class MockEmailProvider implements EmailProvider {
  private readonly sentCodes = new Map<string, string>();

  async sendOtp(to: string, code: string, _locale: string): Promise<void> {
    this.sentCodes.set(to.toLowerCase(), code);
  }

  getLastCode(email: string): string | undefined {
    return this.sentCodes.get(email.toLowerCase());
  }

  clear(): void {
    this.sentCodes.clear();
  }
}
