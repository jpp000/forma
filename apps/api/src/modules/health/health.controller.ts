import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Controller()
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  health() {
    return {
      status: 'ok',
      service: 'forma-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  async ready() {
    await this.prisma.platformHealthCheck.findFirst({
      orderBy: { checkedAt: 'desc' },
    });

    return {
      status: 'ready',
      database: 'connected',
      timestamp: new Date().toISOString(),
    };
  }
}
