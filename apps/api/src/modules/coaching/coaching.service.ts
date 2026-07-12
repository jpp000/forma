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

  async getOwnProfile(userId: string) {
    const profile = await this.getProfileByUserId(userId);
    if (!profile) {
      throw new NotFoundException('errors.forbidden');
    }
    return profile;
  }

  toPublicProfessional(profile: {
    id: string;
    userId: string;
    type: string;
    credentials: string;
    displayName: string | null;
    bio: string | null;
    slug: string | null;
    isPublished: boolean;
  }) {
    return {
      id: profile.id,
      userId: profile.userId,
      type: profile.type,
      credentials: profile.credentials,
      displayName: profile.displayName,
      bio: profile.bio,
      slug: profile.slug,
    };
  }

  async listPublicProfessionals(query?: string) {
    const q = query?.trim();
    const profiles = await this.prisma.coachingProfessionalProfile.findMany({
      where: {
        isPublished: true,
        ...(q
          ? {
              OR: [
                { displayName: { contains: q, mode: 'insensitive' } },
                { slug: { contains: q, mode: 'insensitive' } },
                { credentials: { contains: q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: { displayName: 'asc' },
      take: 50,
    });

    return { professionals: profiles.map((p) => this.toPublicProfessional(p)) };
  }

  async getPublicProfessional(idOrSlug: string) {
    const profile = await this.prisma.coachingProfessionalProfile.findFirst({
      where: {
        isPublished: true,
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!profile) {
      throw new NotFoundException('errors.forbidden');
    }

    return this.toPublicProfessional(profile);
  }

  async createLinkRequest(studentUserId: string, professionalUserId: string) {
    if (studentUserId === professionalUserId) {
      throw new BadRequestException('errors.forbidden');
    }

    const profile = await this.prisma.coachingProfessionalProfile.findUnique({
      where: { userId: professionalUserId },
    });
    if (!profile?.isPublished) {
      throw new NotFoundException('errors.coaching_professional_unavailable');
    }

    const existingLink = await this.prisma.coachingLink.findUnique({
      where: {
        professionalUserId_studentUserId: {
          professionalUserId,
          studentUserId,
        },
      },
    });
    if (existingLink) {
      throw new ConflictException('errors.coaching_link_exists');
    }

    await this.expireStalePendingRequests(studentUserId, professionalUserId);

    const pending = await this.prisma.coachingLinkRequest.findFirst({
      where: {
        professionalUserId,
        studentUserId,
        status: 'pending',
      },
    });
    if (pending) {
      return pending;
    }

    return this.prisma.coachingLinkRequest.create({
      data: {
        professionalUserId,
        studentUserId,
        status: 'pending',
      },
    });
  }

  async listLinkRequests(professionalUserId: string) {
    await this.expireStalePendingRequests(undefined, professionalUserId);

    const requests = await this.prisma.coachingLinkRequest.findMany({
      where: {
        professionalUserId,
        status: 'pending',
      },
      orderBy: { createdAt: 'desc' },
    });

    const enriched = await Promise.all(
      requests.map(async (req) => {
        const student = await this.prisma.identityUser.findUniqueOrThrow({
          where: { id: req.studentUserId },
        });
        return {
          id: req.id,
          studentUserId: req.studentUserId,
          studentEmail: student.email,
          status: req.status,
          createdAt: req.createdAt,
        };
      }),
    );

    return { requests: enriched };
  }

  async listMyLinkRequests(studentUserId: string) {
    await this.expireStalePendingRequests(studentUserId, undefined);

    const requests = await this.prisma.coachingLinkRequest.findMany({
      where: { studentUserId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return {
      requests: requests.map((req) => ({
        id: req.id,
        professionalUserId: req.professionalUserId,
        status: req.status,
        createdAt: req.createdAt,
        resolvedAt: req.resolvedAt,
      })),
    };
  }

  async acceptLinkRequest(professionalUserId: string, requestId: string) {
    const req = await this.getOwnedPendingRequest(
      professionalUserId,
      requestId,
    );

    const existingLink = await this.prisma.coachingLink.findUnique({
      where: {
        professionalUserId_studentUserId: {
          professionalUserId,
          studentUserId: req.studentUserId,
        },
      },
    });

    if (!existingLink) {
      await this.prisma.coachingLink.create({
        data: {
          professionalUserId,
          studentUserId: req.studentUserId,
        },
      });
    }

    return this.prisma.coachingLinkRequest.update({
      where: { id: req.id },
      data: {
        status: 'accepted',
        resolvedAt: new Date(),
      },
    });
  }

  async declineLinkRequest(professionalUserId: string, requestId: string) {
    const req = await this.getOwnedPendingRequest(
      professionalUserId,
      requestId,
    );

    return this.prisma.coachingLinkRequest.update({
      where: { id: req.id },
      data: {
        status: 'declined',
        resolvedAt: new Date(),
      },
    });
  }

  private async getOwnedPendingRequest(
    professionalUserId: string,
    requestId: string,
  ) {
    const req = await this.prisma.coachingLinkRequest.findUnique({
      where: { id: requestId },
    });

    if (!req || req.professionalUserId !== professionalUserId) {
      throw new NotFoundException('errors.coaching_request_not_found');
    }

    if (req.status !== 'pending') {
      throw new ConflictException('errors.coaching_request_not_pending');
    }

    const ttlMs = 30 * 24 * 60 * 60 * 1000;
    if (req.createdAt.getTime() + ttlMs <= Date.now()) {
      await this.prisma.coachingLinkRequest.update({
        where: { id: req.id },
        data: { status: 'expired', resolvedAt: new Date() },
      });
      throw new GoneException('errors.coaching_request_not_pending');
    }

    return req;
  }

  private async expireStalePendingRequests(
    studentUserId?: string,
    professionalUserId?: string,
  ) {
    const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    await this.prisma.coachingLinkRequest.updateMany({
      where: {
        status: 'pending',
        createdAt: { lte: cutoff },
        ...(studentUserId ? { studentUserId } : {}),
        ...(professionalUserId ? { professionalUserId } : {}),
      },
      data: {
        status: 'expired',
        resolvedAt: new Date(),
      },
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
