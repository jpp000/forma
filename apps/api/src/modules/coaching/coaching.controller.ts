import { Role } from '@forma/types';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { EntitlementGuard } from '../../common/entitlement.guard';
import { RequiresEntitlement } from '../../common/requires-entitlement.decorator';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CoachingService } from './coaching.service';
import { CreateCoachingProfileDto } from './dto/create-coaching-profile.dto';
import { CreateInviteDto } from './dto/create-invite.dto';
import { UpdateCoachingProfileDto } from './dto/update-coaching-profile.dto';

@ApiTags('coaching')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('coaching')
export class CoachingController {
  constructor(private readonly coachingService: CoachingService) {}

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

  @Patch('profile')
  @UseGuards(RolesGuard)
  @Roles(Role.Trainer, Role.Nutritionist)
  @ApiOperation({ summary: 'Update professional public profile fields' })
  async updateProfile(
    @CurrentUser() user: { id: string },
    @Body() body: UpdateCoachingProfileDto,
  ) {
    return this.coachingService.updateProfile(user.id, body);
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
    return this.coachingService.acceptInvite(token, user.id, user.email);
  }

  @Get('dashboard')
  @UseGuards(RolesGuard)
  @Roles(Role.Trainer, Role.Nutritionist)
  @ApiOperation({ summary: 'Professional dashboard' })
  async dashboard(@CurrentUser() user: { id: string }) {
    return this.coachingService.getDashboard(user.id);
  }
}
