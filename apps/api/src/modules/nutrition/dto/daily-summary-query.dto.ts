import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DailySummaryQueryDto {
  @ApiPropertyOptional({ example: '2026-07-07' })
  @IsOptional()
  @IsDateString()
  date?: string;
}
