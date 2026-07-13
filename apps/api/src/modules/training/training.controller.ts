import { Role } from '@forma/types';
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { CreateWorkoutPlanDto } from './dto/create-workout-plan.dto';
import { CreateWorkoutSessionDto } from './dto/create-workout-session.dto';
import { ListExercisesQueryDto } from './dto/list-exercises-query.dto';
import { PrescribeWorkoutPlanDto } from './dto/prescribe-workout-plan.dto';
import {
  CreateWorkoutTemplateDto,
  UpdateWorkoutTemplateDto,
} from './dto/workout-template.dto';
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

  @Post('plans')
  @ApiOperation({ summary: 'Create workout plan' })
  async createPlan(
    @CurrentUser() user: { id: string },
    @Body() body: CreateWorkoutPlanDto,
  ) {
    return this.trainingService.createWorkoutPlan(user.id, body);
  }

  @Get('plans')
  @ApiOperation({ summary: 'List workout plans' })
  async listPlans(
    @CurrentUser() user: { id: string },
    @Query() query: ListExercisesQueryDto,
  ) {
    return this.trainingService.listWorkoutPlans(
      user.id,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Post('plans/prescribe')
  @Roles(Role.Trainer)
  @ApiOperation({ summary: 'Prescribe a workout plan to a linked student' })
  async prescribePlan(
    @CurrentUser() user: { id: string },
    @Body() body: PrescribeWorkoutPlanDto,
  ) {
    return this.trainingService.prescribeWorkoutPlan(user.id, body);
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Log workout session' })
  async logSession(
    @CurrentUser() user: { id: string },
    @Body() body: CreateWorkoutSessionDto,
  ) {
    return this.trainingService.logWorkoutSession(user.id, body);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'Workout session history' })
  async listSessions(
    @CurrentUser() user: { id: string },
    @Query() query: ListExercisesQueryDto,
  ) {
    return this.trainingService.listWorkoutSessions(
      user.id,
      query.page ?? 1,
      query.limit ?? 20,
    );
  }

  @Post('templates')
  @Roles(Role.Trainer)
  @ApiOperation({ summary: 'Create workout template' })
  async createTemplate(
    @CurrentUser() user: { id: string },
    @Body() body: CreateWorkoutTemplateDto,
  ) {
    return this.trainingService.createTemplate(user.id, body);
  }

  @Get('templates')
  @Roles(Role.Trainer)
  @ApiOperation({ summary: 'List own workout templates' })
  async listTemplates(@CurrentUser() user: { id: string }) {
    return this.trainingService.listTemplates(user.id);
  }

  @Patch('templates/:id')
  @Roles(Role.Trainer)
  @ApiOperation({ summary: 'Update workout template' })
  async updateTemplate(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: UpdateWorkoutTemplateDto,
  ) {
    return this.trainingService.updateTemplate(user.id, id, body);
  }

  @Post('templates/:id/archive')
  @Roles(Role.Trainer)
  @ApiOperation({ summary: 'Archive workout template' })
  async archiveTemplate(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
  ) {
    return this.trainingService.archiveTemplate(user.id, id);
  }
}
