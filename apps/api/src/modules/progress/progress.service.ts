import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { LogWeightDto } from './dto/log-weight.dto';

function parseLogDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async logWeight(userId: string, dto: LogWeightDto) {
    const logDate = parseLogDate(dto.date);

    return this.prisma.progressWeightEntry.upsert({
      where: {
        userId_logDate: { userId, logDate },
      },
      create: {
        userId,
        weightKg: dto.weightKg,
        logDate,
      },
      update: {
        weightKg: dto.weightKg,
      },
    });
  }

  async getWeightHistory(userId: string, from?: string, to?: string) {
    const where: { userId: string; logDate?: { gte?: Date; lte?: Date } } = {
      userId,
    };

    if (from || to) {
      where.logDate = {};
      if (from) where.logDate.gte = parseLogDate(from);
      if (to) where.logDate.lte = parseLogDate(to);
    }

    return this.prisma.progressWeightEntry.findMany({
      where,
      orderBy: { logDate: 'asc' },
    });
  }

  async getLatestWeight(userId: string) {
    return this.prisma.progressWeightEntry.findFirst({
      where: { userId },
      orderBy: { logDate: 'desc' },
    });
  }

  async getWeightTrend(userId: string): Promise<'up' | 'down' | 'stable'> {
    const entries = await this.prisma.progressWeightEntry.findMany({
      where: { userId },
      orderBy: { logDate: 'desc' },
      take: 2,
    });
    if (entries.length < 2) return 'stable';
    const diff = entries[0].weightKg - entries[1].weightKg;
    if (diff > 0.2) return 'up';
    if (diff < -0.2) return 'down';
    return 'stable';
  }
}
