import { createHash, randomInt } from 'node:crypto';
import { Role } from '@forma/types';
import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { SupportedLocale } from '../../i18n/i18n.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { EmailProvider } from './email/email-provider.interface';
import { EMAIL_PROVIDER } from './email/email-provider.interface';

const OTP_TTL_MS = 10 * 60 * 1000;
const OTP_RATE_WINDOW_MS = 15 * 60 * 1000;
const OTP_RATE_LIMIT = 3;
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class IdentityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    @Inject(EMAIL_PROVIDER) private readonly emailProvider: EmailProvider,
  ) {}

  async requestOtp(email: string, locale: SupportedLocale): Promise<void> {
    const normalizedEmail = email.toLowerCase().trim();
    const windowStart = new Date(Date.now() - OTP_RATE_WINDOW_MS);

    const recentCount = await this.prisma.identityOtpToken.count({
      where: {
        email: normalizedEmail,
        createdAt: { gte: windowStart },
      },
    });

    if (recentCount >= OTP_RATE_LIMIT) {
      throw new HttpException(
        'errors.otp_rate_limit',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const code = String(randomInt(100000, 999999));
    const codeHash = this.hashCode(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await this.prisma.identityOtpToken.create({
      data: {
        email: normalizedEmail,
        codeHash,
        expiresAt,
      },
    });

    await this.emailProvider.sendOtp(normalizedEmail, code, locale);
  }

  async verifyOtp(
    email: string,
    code: string,
  ): Promise<{ accessToken: string }> {
    const normalizedEmail = email.toLowerCase().trim();
    const codeHash = this.hashCode(code);
    const now = new Date();

    const token = await this.prisma.identityOtpToken.findFirst({
      where: {
        email: normalizedEmail,
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!token) {
      throw new UnauthorizedException('errors.otp_invalid');
    }

    if (token.expiresAt <= now) {
      throw new UnauthorizedException('errors.otp_expired');
    }

    if (token.codeHash !== codeHash) {
      throw new UnauthorizedException('errors.otp_invalid');
    }

    const user = await this.prisma.identityUser.upsert({
      where: { email: normalizedEmail },
      create: { email: normalizedEmail },
      update: {},
    });

    await this.prisma.identityOtpToken.update({
      where: { id: token.id },
      data: { usedAt: now },
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

  async getMe(
    userId: string,
  ): Promise<{ id: string; email: string; roles: Role[] }> {
    const user = await this.prisma.identityUser.findUniqueOrThrow({
      where: { id: userId },
    });

    const roles = await this.computeRoles(userId);

    return {
      id: user.id,
      email: user.email,
      roles,
    };
  }

  async computeRoles(userId: string): Promise<Role[]> {
    const roles: Role[] = [];

    const studentProfile = await this.prisma.studentProfile.findUnique({
      where: { userId },
    });
    if (studentProfile) {
      roles.push(Role.Student);
    }

    return roles;
  }

  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }
}
