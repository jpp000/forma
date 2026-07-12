import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CoachingService } from './coaching.service';

@ApiTags('coaching')
@Controller('coaching/professionals')
export class CoachingPublicController {
  constructor(private readonly coachingService: CoachingService) {}

  @Get()
  @ApiOperation({ summary: 'Browse published professional profiles' })
  list(@Query('q') q?: string) {
    return this.coachingService.listPublicProfessionals(q);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get a published professional profile' })
  get(@Param('idOrSlug') idOrSlug: string) {
    return this.coachingService.getPublicProfessional(idOrSlug);
  }
}
