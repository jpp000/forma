import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';

export class MarkTrainingRestDayDto {
  @ApiProperty({ example: '2026-07-07' })
  @IsDateString()
  date!: string;
}
