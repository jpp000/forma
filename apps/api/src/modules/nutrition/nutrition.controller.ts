import { Role } from '@forma/types';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CreateNutritionPlanDto } from './dto/create-nutrition-plan.dto';
import { DailySummaryQueryDto } from './dto/daily-summary-query.dto';
import { LogMealDto } from './dto/log-meal.dto';
import { NutritionService } from './nutrition.service';

@ApiTags('nutrition')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('meals')
  @Roles(Role.Student)
  @ApiOperation({ summary: 'Log meal with manual macros' })
  async logMeal(@CurrentUser() user: { id: string }, @Body() body: LogMealDto) {
    return this.nutritionService.logMeal(user.id, body);
  }

  @Get('daily')
  @Roles(Role.Student)
  @ApiOperation({ summary: 'Daily macro summary' })
  async dailySummary(
    @CurrentUser() user: { id: string },
    @Query() query: DailySummaryQueryDto,
  ) {
    const date = query.date ?? new Date().toISOString().slice(0, 10);
    return this.nutritionService.getDailySummary(user.id, date);
  }

  @Post('plans')
  @ApiOperation({ summary: 'Prescribe nutrition plan for linked student' })
  async prescribePlan(
    @CurrentUser() user: { id: string },
    @Body() body: CreateNutritionPlanDto,
  ) {
    return this.nutritionService.prescribePlan(user.id, body);
  }
}
