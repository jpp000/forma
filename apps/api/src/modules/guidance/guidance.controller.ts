import { Role } from '@forma/types';
import { Controller, Get, Headers, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { I18nService } from '../../i18n/i18n.service';
import { StudentService } from '../student/student.service';
import { GuidanceService } from './guidance.service';

@ApiTags('guidance')
@ApiBearerAuth()
@UseGuards(AuthGuard, RolesGuard)
@Controller('guidance')
export class GuidanceController {
  constructor(
    private readonly guidanceService: GuidanceService,
    private readonly studentService: StudentService,
    private readonly i18n: I18nService,
  ) {}

  @Get('daily')
  @Roles(Role.Student)
  @ApiOperation({ summary: 'Daily guidance suggestions' })
  async daily(
    @CurrentUser() user: { id: string },
    @Headers('accept-language') acceptLanguage?: string,
  ) {
    await this.studentService.requireProfile(user.id);
    const lang = this.i18n.resolveLanguage(acceptLanguage);
    return this.guidanceService.getDailySuggestions(user.id, lang);
  }
}
