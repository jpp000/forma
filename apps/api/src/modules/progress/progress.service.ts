import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type { LogWeightDto } from './dto/log-weight.dto';
import type { MarkTrainingRestDayDto } from './dto/mark-training-rest-day.dto';

function parseLogDate(date: string): Date {
  return new Date(`${date}T00:00:00.000Z`);
}

function previousDay(date: Date): Date {
  const prev = new Date(date);
  prev.setUTCDate(prev.getUTCDate() - 1);
  return prev;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function diffDays(from: Date, to: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((to.getTime() - from.getTime()) / msPerDay);
}

function getIsoWeekKey(date: Date): string {
  const target = new Date(date);
  target.setUTCHours(0, 0, 0, 0);
  target.setUTCDate(target.getUTCDate() + 4 - (target.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const week = Math.ceil(
    ((target.getTime() - yearStart.getTime()) / 86400000 + 1) / 7,
  );
  return `${target.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
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
    if (streakType === 'training') {
      return this.applyTrainingActivity(userId, date);
    }

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

  async applyTrainingActivity(userId: string, date: string) {
    const activeDate = parseLogDate(date);
    const existing = await this.prisma.progressStreak.findUnique({
      where: { userId_streakType: { userId, streakType: 'training' } },
    });

    if (
      existing?.lastActiveDate &&
      sameDay(existing.lastActiveDate, activeDate)
    ) {
      return existing;
    }

    let currentStreak = 1;
    let graceWeekKey = existing?.graceWeekKey ?? null;
    let graceGapsUsed = existing?.graceGapsUsed ?? 0;

    if (!existing?.lastActiveDate) {
      currentStreak = 1;
    } else if (sameDay(activeDate, addDays(existing.lastActiveDate, 1))) {
      currentStreak = existing.currentStreak + 1;
    } else if (activeDate > existing.lastActiveDate) {
      const gapStart = addDays(existing.lastActiveDate, 1);
      const gapEnd = addDays(activeDate, -1);
      const uncoveredGapDays: Date[] = [];

      for (
        let cursor = new Date(gapStart);
        cursor <= gapEnd;
        cursor = addDays(cursor, 1)
      ) {
        const restDay = await this.prisma.progressTrainingRestDay.findUnique({
          where: {
            userId_restDate: { userId, restDate: cursor },
          },
        });
        if (!restDay) {
          uncoveredGapDays.push(new Date(cursor));
        }
      }

      if (uncoveredGapDays.length === 0) {
        currentStreak =
          existing.currentStreak +
          diffDays(existing.lastActiveDate, activeDate);
      } else if (uncoveredGapDays.length === 1) {
        const gapWeekKey = getIsoWeekKey(uncoveredGapDays[0]);
        if (graceWeekKey !== gapWeekKey) {
          graceWeekKey = gapWeekKey;
          graceGapsUsed = 0;
        }

        if (graceGapsUsed < 1) {
          graceGapsUsed += 1;
          currentStreak = existing.currentStreak + 1;
        } else {
          currentStreak = 1;
        }
      } else {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }

    const activeWeekKey = getIsoWeekKey(activeDate);
    if (graceWeekKey && graceWeekKey !== activeWeekKey && graceGapsUsed === 0) {
      graceWeekKey = activeWeekKey;
    }

    const longestStreak = Math.max(currentStreak, existing?.longestStreak ?? 0);

    return this.prisma.progressStreak.upsert({
      where: { userId_streakType: { userId, streakType: 'training' } },
      create: {
        userId,
        streakType: 'training',
        currentStreak,
        longestStreak,
        lastActiveDate: activeDate,
        graceWeekKey,
        graceGapsUsed,
      },
      update: {
        currentStreak,
        longestStreak,
        lastActiveDate: activeDate,
        graceWeekKey,
        graceGapsUsed,
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

  async markTrainingRestDay(userId: string, dto: MarkTrainingRestDayDto) {
    const restDate = parseLogDate(dto.date);

    const restDay = await this.prisma.progressTrainingRestDay.upsert({
      where: {
        userId_restDate: { userId, restDate },
      },
      create: {
        userId,
        restDate,
        source: 'explicit',
      },
      update: {},
    });

    await this.applyTrainingActivity(userId, dto.date);

    return restDay;
  }

  async listTrainingRestDays(userId: string, from?: string, to?: string) {
    const now = new Date();
    const defaultFrom = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
    );
    const rangeFrom = from ? parseLogDate(from) : defaultFrom;
    const rangeTo = to ? parseLogDate(to) : undefined;

    const restDays = await this.prisma.progressTrainingRestDay.findMany({
      where: {
        userId,
        restDate: {
          gte: rangeFrom,
          ...(rangeTo ? { lte: rangeTo } : {}),
        },
      },
      orderBy: { restDate: 'asc' },
    });

    return restDays.map((day) => ({
      id: day.id,
      restDate: day.restDate.toISOString().slice(0, 10),
      source: day.source,
    }));
  }
}
