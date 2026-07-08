import { Role } from '@forma/types';
import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { EntitlementGuard } from '../../common/entitlement.guard';
import { RequiresEntitlement } from '../../common/requires-entitlement.decorator';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { IdentityService } from '../identity/identity.service';
import { CoachingService } from './coaching.service';
import { CreateCoachingProfileDto } from './dto/create-coaching-profile.dto';
import { CreateInviteDto } from './dto/create-invite.dto';

@ApiTags('coaching')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('coaching')
export class CoachingController {
  constructor(
    private readonly coachingService: CoachingService,
    private readonly identityService: IdentityService,
  ) {}

  @Post('profile')
  @UseGuards(EntitlementGuard)
  @RequiresEntitlement('professional_profile')
  @ApiOperation({ summary: 'Create professional profile' })
  async createProfile(
    @CurrentUser() user: { id: string },
    @Body() body: CreateCoachingProfileDto,
  ) {
    return this.coachingService.createProfile(user.id, body);
  }

  @Post('invites')
  @UseGuards(RolesGuard)
  @Roles(Role.Trainer, Role.Nutritionist)
  @ApiOperation({ summary: 'Send student invite' })
  async createInvite(
    @CurrentUser() user: { id: string },
    @Body() body: CreateInviteDto,
  ) {
    return this.coachingService.createInvite(user.id, body.studentEmail);
  }

  @Post('invites/:token/accept')
  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @ApiOperation({ summary: 'Accept coaching invite' })
  async acceptInvite(
    @CurrentUser() user: { id: string; email: string },
    @Param('token') token: string,
  ) {
    const link = await this.coachingService.acceptInvite(
      token,
      user.id,
      user.email,
    );
    return link;
  }

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles(Role.Trainer, Role.Nutritionist)
  @ApiOperation({ summary: 'Professional dashboard' })
  async dashboard(@CurrentUser() user: { id: string }) {
    return this.coachingService.getDashboard(user.id);
  }
}
