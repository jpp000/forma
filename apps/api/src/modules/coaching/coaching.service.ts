import { randomBytes } from 'node:crypto';
import { Role } from '@forma/types';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  forwardRef,
  GoneException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { NutritionService } from '../nutrition/nutrition.service';
import { ProgressService } from '../progress/progress.service';
import { TrainingService } from '../training/training.service';
import type { CreateCoachingProfileDto } from './dto/create-coaching-profile.dto';
import type { UpdateCoachingProfileDto } from './dto/update-coaching-profile.dto';

const INVITE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

@Injectable()
export class CoachingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly trainingService: TrainingService,
    @Inject(forwardRef(() => NutritionService))
    private readonly nutritionService: NutritionService,
    private readonly progressService: ProgressService,
  ) {}

  async createProfile(userId: string, dto: CreateCoachingProfileDto) {
    const existing = await this.prisma.coachingProfessionalProfile.findUnique({
      where: { userId },
    });
    if (existing) {
      return existing;
    }

    return this.prisma.coachingProfessionalProfile.create({
      data: {
        userId,
        type: dto.type,
        credentials: dto.credentials,
      },
    });
  }

  async updateProfile(userId: string, dto: UpdateCoachingProfileDto) {
    const existing = await this.prisma.coachingProfessionalProfile.findUnique({
      where: { userId },
    });
    if (!existing) {
      throw new NotFoundException('errors.forbidden');
    }

    if (dto.slug !== undefined) {
      const clash = await this.prisma.coachingProfessionalProfile.findFirst({
        where: {
          slug: dto.slug,
          NOT: { userId },
        },
      });
      if (clash) {
        throw new ConflictException('errors.coaching_slug_taken');
      }
    }

    const nextPublished = dto.isPublished ?? existing.isPublished;
    const nextDisplayName =
      dto.displayName !== undefined ? dto.displayName : existing.displayName;
    const nextSlug = dto.slug !== undefined ? dto.slug : existing.slug;
    const nextCredentials =
      dto.credentials !== undefined ? dto.credentials : existing.credentials;

    if (nextPublished) {
      if (
        !nextDisplayName?.trim() ||
        !nextSlug?.trim() ||
        !nextCredentials?.trim()
      ) {
        throw new BadRequestException('errors.coaching_publish_incomplete');
      }
    }

    return this.prisma.coachingProfessionalProfile.update({
      where: { userId },
      data: {
        ...(dto.displayName !== undefined
          ? { displayName: dto.displayName.trim() }
          : {}),
        ...(dto.bio !== undefined ? { bio: dto.bio } : {}),
        ...(dto.slug !== undefined ? { slug: dto.slug } : {}),
        ...(dto.isPublished !== undefined
          ? { isPublished: dto.isPublished }
          : {}),
        ...(dto.credentials !== undefined
          ? { credentials: dto.credentials.trim() }
          : {}),
      },
    });
  }

  async getProfileByUserId(userId: string) {
    return this.prisma.coachingProfessionalProfile.findUnique({
      where: { userId },
    });
  }

  async createInvite(professionalUserId: string, studentEmail: string) {
    const token = randomBytes(24).toString('hex');
    const normalizedEmail = studentEmail.toLowerCase().trim();

    return this.prisma.coachingInvite.create({
      data: {
        professionalUserId,
        studentEmail: normalizedEmail,
        token,
        expiresAt: new Date(Date.now() + INVITE_TTL_MS),
      },
    });
  }

  async acceptInvite(
    token: string,
    studentUserId: string,
    studentEmail: string,
  ) {
    const invite = await this.prisma.coachingInvite.findUnique({
      where: { token },
    });

    if (!invite) {
      throw new NotFoundException('errors.invite_not_found');
    }

    if (invite.expiresAt <= new Date()) {
      throw new GoneException('errors.invite_expired');
    }

    if (invite.acceptedAt) {
      throw new ConflictException('errors.invite_already_accepted');
    }

    const normalizedEmail = studentEmail.toLowerCase().trim();
    if (invite.studentEmail !== normalizedEmail) {
      throw new ForbiddenException('errors.invite_email_mismatch');
    }

    const existingLink = await this.prisma.coachingLink.findUnique({
      where: {
        professionalUserId_studentUserId: {
          professionalUserId: invite.professionalUserId,
          studentUserId,
        },
      },
    });

    if (existingLink) {
      throw new ConflictException('errors.coaching_link_exists');
    }

    await this.prisma.coachingInvite.update({
      where: { id: invite.id },
      data: { acceptedAt: new Date() },
    });

    return this.prisma.coachingLink.create({
      data: {
        professionalUserId: invite.professionalUserId,
        studentUserId,
      },
    });
  }

  async assertLinked(professionalUserId: string, studentUserId: string) {
    const link = await this.prisma.coachingLink.findUnique({
      where: {
        professionalUserId_studentUserId: {
          professionalUserId,
          studentUserId,
        },
      },
    });

    if (!link) {
      throw new ForbiddenException('errors.coaching_link_required');
    }
  }

  async getDashboard(professionalUserId: string) {
    const links = await this.prisma.coachingLink.findMany({
      where: { professionalUserId },
    });

    const students = await Promise.all(
      links.map(async (link) => {
        const user = await this.prisma.identityUser.findUniqueOrThrow({
          where: { id: link.studentUserId },
        });
        const lastWorkout = await this.trainingService.getLastSessionDate(
          link.studentUserId,
        );
        const lastMeal = await this.nutritionService.getLastMealDate(
          link.studentUserId,
        );
        const weightTrend = await this.progressService.getWeightTrend(
          link.studentUserId,
        );

        return {
          studentId: user.id,
          email: user.email,
          lastWorkout,
          lastMeal,
          weightTrend,
        };
      }),
    );

    return { students };
  }

  async getProfessionalRole(userId: string): Promise<Role | null> {
    const profile = await this.getProfileByUserId(userId);
    if (!profile) return null;
    return profile.type === 'trainer' ? Role.Trainer : Role.Nutritionist;
  }
}
