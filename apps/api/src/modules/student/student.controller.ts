import { Body, Controller, Post, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Role } from '@forma/types';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { CreateStudentProfileDto } from './dto/create-student-profile.dto';
import { SetHealthGoalDto } from './dto/set-health-goal.dto';
import { StudentService } from './student.service';

@ApiTags('student')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('student')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Post('profile')
  @ApiOperation({ summary: 'Create student profile' })
  async createProfile(
    @CurrentUser() user: { id: string },
    @Body() body: CreateStudentProfileDto,
  ) {
    return this.studentService.createProfile(user.id, body);
  }

  @Put('goal')
  @Roles(Role.Student)
  @UseGuards(RolesGuard)
  @ApiOperation({ summary: 'Set health goal' })
  async setGoal(
    @CurrentUser() user: { id: string },
    @Body() body: SetHealthGoalDto,
  ) {
    return this.studentService.setHealthGoal(user.id, body);
  }
}
