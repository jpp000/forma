import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateNutritionPlanDto {
  @ApiProperty()
  @IsString()
  studentUserId!: string;

  @ApiProperty({ example: 2000 })
  @IsInt()
  @Min(0)
  dailyCalories!: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  dailyProtein!: number;

  @ApiProperty({ example: 200 })
  @IsNumber()
  @Min(0)
  dailyCarbs!: number;

  @ApiProperty({ example: 65 })
  @IsNumber()
  @Min(0)
  dailyFat!: number;
}

export class DailySummaryQueryDto {
  @ApiProperty({ example: '2026-07-07' })
  @IsDateString()
  date!: string;
}
