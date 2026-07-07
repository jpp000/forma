import { HealthGoal } from '@forma/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNumber, IsOptional, Min } from 'class-validator';

export class SetHealthGoalDto {
  @ApiProperty({ enum: HealthGoal })
  @IsEnum(HealthGoal)
  goalType!: HealthGoal;

  @ApiPropertyOptional({ example: 75 })
  @IsOptional()
  @IsNumber()
  @Min(30)
  targetWeightKg?: number;

  @ApiPropertyOptional({ example: 2000 })
  @IsOptional()
  @IsInt()
  @Min(800)
  targetCalories?: number;
}
