import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthGuard } from '../../common/auth.guard';
import { EmailModule } from './email/email.module';
import { IdentityController } from './identity.controller';
import { IdentityService } from './identity.service';
import { OAuthController } from './oauth/oauth.controller';
import { OAuthService } from './oauth/oauth.service';

@Module({
  imports: [
    EmailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [IdentityController, OAuthController],
  providers: [IdentityService, AuthGuard, OAuthService],
  exports: [IdentityService, JwtModule, AuthGuard],
})
export class IdentityModule {}
