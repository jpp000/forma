import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNumber, Min } from 'class-validator';

export class LogWeightDto {
  @ApiProperty({ example: 72.5 })
  @IsNumber()
  @Min(0)
  weightKg!: number;

  @ApiProperty({ example: '2026-07-07' })
  @IsDateString()
  date!: string;
}
