import { Role } from '@forma/types';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { ListTrainingRestDaysQueryDto } from './dto/list-training-rest-days-query.dto';
import { LogWeightDto } from './dto/log-weight.dto';
import { MarkTrainingRestDayDto } from './dto/mark-training-rest-day.dto';
import { WeightHistoryQueryDto } from './dto/weight-history-query.dto';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Student)
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('weight')
  @ApiOperation({ summary: 'Log weight entry' })
  async logWeight(
    @CurrentUser() user: { id: string },
    @Body() body: LogWeightDto,
  ) {
    return this.progressService.logWeight(user.id, body);
  }

  @Get('weight')
  @ApiOperation({ summary: 'Weight history' })
  async weightHistory(
    @CurrentUser() user: { id: string },
    @Query() query: WeightHistoryQueryDto,
  ) {
    return this.progressService.getWeightHistory(user.id, query.from, query.to);
  }

  @Get('streaks')
  @ApiOperation({ summary: 'Current and longest streaks' })
  async streaks(@CurrentUser() user: { id: string }) {
    return this.progressService.getStreaks(user.id);
  }

  @Post('training-rest-days')
  @ApiOperation({ summary: 'Mark a training rest day' })
  async markTrainingRestDay(
    @CurrentUser() user: { id: string },
    @Body() body: MarkTrainingRestDayDto,
  ) {
    return this.progressService.markTrainingRestDay(user.id, body);
  }

  @Get('training-rest-days')
  @ApiOperation({ summary: 'List training rest days in date range' })
  async listTrainingRestDays(
    @CurrentUser() user: { id: string },
    @Query() query: ListTrainingRestDaysQueryDto,
  ) {
    return this.progressService.listTrainingRestDays(
      user.id,
      query.from,
      query.to,
    );
  }
}
