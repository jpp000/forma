import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { LogWeightDto } from './dto/log-weight.dto';

function parseLogDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function previousDay(date: Date): Date {
  const prev = new Date(date);
  prev.setUTCDate(prev.getUTCDate() - 1);
  return prev;
}

function sameDay(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
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

  async updateStreak(userId: string, streakType: string, date: string) {
    const activeDate = parseLogDate(date);
    const existing = await this.prisma.progressStreak.findUnique({
      where: { userId_streakType: { userId, streakType } },
    });

    if (
      existing?.lastActiveDate &&
      sameDay(existing.lastActiveDate, activeDate)
    ) {
      return existing;
    }

    let currentStreak = 1;
    if (
      existing?.lastActiveDate &&
      sameDay(existing.lastActiveDate, previousDay(activeDate))
    ) {
      currentStreak = existing.currentStreak + 1;
    }

    const longestStreak = Math.max(currentStreak, existing?.longestStreak ?? 0);

    return this.prisma.progressStreak.upsert({
      where: { userId_streakType: { userId, streakType } },
      create: {
        userId,
        streakType,
        currentStreak,
        longestStreak,
        lastActiveDate: activeDate,
      },
      update: {
        currentStreak,
        longestStreak,
        lastActiveDate: activeDate,
      },
    });
  }

  async getStreaks(userId: string) {
    const streaks = await this.prisma.progressStreak.findMany({
      where: { userId },
    });

    const training = streaks.find((s) => s.streakType === 'training');
    const nutrition = streaks.find((s) => s.streakType === 'nutrition');

    return {
      training: {
        current: training?.currentStreak ?? 0,
        longest: training?.longestStreak ?? 0,
      },
      nutrition: {
        current: nutrition?.currentStreak ?? 0,
        longest: nutrition?.longestStreak ?? 0,
      },
    };
  }
}
