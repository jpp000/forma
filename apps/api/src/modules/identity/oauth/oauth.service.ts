import { createHmac } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import type { OAuthProfile, OAuthProvider } from './oauth.types';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class OAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  isMockMode(): boolean {
    return (
      process.env.OAUTH_MOCK === 'true' ||
      process.env.NODE_ENV === 'test' ||
      !process.env.GOOGLE_CLIENT_ID
    );
  }

  getRedirectUrl(
    provider: OAuthProvider,
    baseUrl: string,
    options?: { platform?: string },
  ): string {
    if (this.isMockMode()) {
      const token = this.signMockToken(
        provider,
        'oauth-test@example.com',
        'mock-account-1',
      );
      const params = new URLSearchParams({ mockToken: token });
      if (options?.platform === 'mobile' || options?.platform === 'web') {
        params.set('platform', options.platform);
      }
      return `${baseUrl}/api/identity/oauth/${provider}/callback?${params.toString()}`;
    }

    const callbackUrl = `${baseUrl}/api/identity/oauth/${provider}/callback`;
    switch (provider) {
      case 'google':
        return this.buildGoogleAuthUrl(callbackUrl);
      case 'apple':
        return this.buildAppleAuthUrl(callbackUrl);
      case 'facebook':
        return this.buildFacebookAuthUrl(callbackUrl);
      default:
        throw new UnauthorizedException('errors.oauth_invalid');
    }
  }

  async handleCallback(
    provider: OAuthProvider,
    params: { mockToken?: string; code?: string },
  ): Promise<{ accessToken: string }> {
    const profile = this.isMockMode()
      ? this.verifyMockToken(provider, params.mockToken)
      : await this.exchangeCode(provider, params.code);

    return this.loginWithProfile(profile);
  }

  private async loginWithProfile(
    profile: OAuthProfile,
  ): Promise<{ accessToken: string }> {
    const email = profile.email.toLowerCase();

    let user = await this.prisma.identityUser.findUnique({ where: { email } });

    if (!user) {
      user = await this.prisma.identityUser.create({ data: { email } });
    }

    await this.prisma.identityOAuthAccount.upsert({
      where: {
        provider_providerAccountId: {
          provider: profile.provider,
          providerAccountId: profile.providerAccountId,
        },
      },
      create: {
        userId: user.id,
        provider: profile.provider,
        providerAccountId: profile.providerAccountId,
      },
      update: { userId: user.id },
    });

    const session = await this.prisma.identitySession.create({
      data: {
        userId: user.id,
        expiresAt: new Date(Date.now() + SESSION_TTL_MS),
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      sid: session.id,
    });

    return { accessToken };
  }

  private signMockToken(
    provider: OAuthProvider,
    email: string,
    providerAccountId: string,
  ): string {
    const payload = `${provider}:${email}:${providerAccountId}`;
    return createHmac('sha256', this.mockSecret())
      .update(payload)
      .digest('hex');
  }

  private verifyMockToken(
    provider: OAuthProvider,
    token?: string,
  ): OAuthProfile {
    if (!token) {
      throw new UnauthorizedException('errors.oauth_invalid');
    }

    const email = 'oauth-test@example.com';
    const providerAccountId = 'mock-account-1';
    const expected = this.signMockToken(provider, email, providerAccountId);

    if (token !== expected) {
      throw new UnauthorizedException('errors.oauth_invalid');
    }

    return { provider, email, providerAccountId };
  }

  private async exchangeCode(
    _provider: OAuthProvider,
    code?: string,
  ): Promise<OAuthProfile> {
    if (!code) {
      throw new UnauthorizedException('errors.oauth_invalid');
    }

    throw new UnauthorizedException('errors.oauth_invalid');
  }

  private buildGoogleAuthUrl(callbackUrl: string): string {
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? '',
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  private buildAppleAuthUrl(callbackUrl: string): string {
    const params = new URLSearchParams({
      client_id: process.env.APPLE_CLIENT_ID ?? '',
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'name email',
      response_mode: 'form_post',
    });
    return `https://appleid.apple.com/auth/authorize?${params.toString()}`;
  }

  private buildFacebookAuthUrl(callbackUrl: string): string {
    const params = new URLSearchParams({
      client_id: process.env.FACEBOOK_CLIENT_ID ?? '',
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'email',
    });
    return `https://www.facebook.com/v21.0/dialog/oauth?${params.toString()}`;
  }

  private mockSecret(): string {
    return process.env.OAUTH_MOCK_SECRET ?? 'oauth-mock-secret';
  }
}
