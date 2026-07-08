import { Role } from '@forma/types';
import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { LogMealDto } from './dto/log-meal.dto';
import { NutritionService } from './nutrition.service';

@ApiTags('nutrition')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Student)
@Controller('nutrition')
export class NutritionController {
  constructor(private readonly nutritionService: NutritionService) {}

  @Post('meals')
  @ApiOperation({ summary: 'Log meal with manual macros' })
  async logMeal(
    @CurrentUser() user: { id: string },
    @Body() body: LogMealDto,
  ) {
    return this.nutritionService.logMeal(user.id, body);
  }
}
