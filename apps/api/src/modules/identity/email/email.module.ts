import { Module } from '@nestjs/common';
import { EMAIL_PROVIDER } from './email-provider.interface';
import { MockEmailProvider } from './mock-email.provider';
import { ResendEmailProvider } from './resend-email.provider';

const providerFactory = {
  provide: EMAIL_PROVIDER,
  useFactory: (mock: MockEmailProvider) => {
    const emailProvider = process.env.EMAIL_PROVIDER ?? 'mock';
    if (emailProvider === 'resend') {
      return new ResendEmailProvider();
    }
    return mock;
  },
  inject: [MockEmailProvider],
};

@Module({
  providers: [providerFactory, MockEmailProvider],
  exports: [EMAIL_PROVIDER, MockEmailProvider],
})
export class EmailModule {}
