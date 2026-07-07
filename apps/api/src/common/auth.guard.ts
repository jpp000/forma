import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';

export type AuthenticatedRequest = {
  headers: { authorization?: string };
  user?: { id: string; email: string };
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;

    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('errors.unauthorized');
    }

    const token = authorization.slice('Bearer '.length);

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        sid: string;
      }>(token);

      const session = await this.prisma.identitySession.findUnique({
        where: { id: payload.sid },
        include: { user: true },
      });

      if (!session || session.expiresAt <= new Date()) {
        throw new UnauthorizedException('errors.unauthorized');
      }

      request.user = {
        id: session.user.id,
        email: session.user.email,
      };

      return true;
    } catch {
      throw new UnauthorizedException('errors.unauthorized');
    }
  }
}
