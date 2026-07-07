import { Role } from '@forma/types';
import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { ListExercisesQueryDto } from './dto/list-exercises-query.dto';
import { TrainingService } from './training.service';

@ApiTags('training')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Roles(Role.Student)
@Controller('training')
export class TrainingController {
  constructor(private readonly trainingService: TrainingService) {}

  @Post('exercises')
  @ApiOperation({ summary: 'Create custom exercise' })
  async createExercise(
    @CurrentUser() user: { id: string },
    @Body() body: CreateExerciseDto,
  ) {
    return this.trainingService.createExercise(user.id, body);
  }

  @Get('exercises')
  @ApiOperation({ summary: 'List custom exercises' })
  async listExercises(
    @CurrentUser() user: { id: string },
    @Query() query: ListExercisesQueryDto,
  ) {
    return this.trainingService.listExercises(
      user.id,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }
}
