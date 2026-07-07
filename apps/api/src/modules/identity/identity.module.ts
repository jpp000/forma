import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { EmailModule } from './email/email.module';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';

@Module({
  imports: [
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [IdentityController],
  providers: [IdentityService],
  exports: [IdentityService, JwtModule],
})
export class IdentityModule {}
