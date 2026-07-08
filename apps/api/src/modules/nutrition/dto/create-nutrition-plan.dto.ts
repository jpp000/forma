import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateNutritionPlanDto {
  @ApiProperty()
  @IsString()
  studentUserId!: string;

  @ApiProperty({ example: 2200 })
  @IsInt()
  @Min(0)
  dailyCalories!: number;

  @ApiProperty({ example: 150 })
  @IsNumber()
  @Min(0)
  dailyProtein!: number;

  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(0)
  dailyCarbs!: number;

  @ApiProperty({ example: 70 })
  @IsNumber()
  @Min(0)
  dailyFat!: number;
}
