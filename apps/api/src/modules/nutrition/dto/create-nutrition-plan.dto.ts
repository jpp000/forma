import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateNutritionPlanDto {
  @ApiProperty()
  @IsString()
  studentUserId!: string;

  @ApiPropertyOptional({
    description: 'Prescribe from an owned nutrition template',
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional({ example: 2200 })
  @IsOptional()
  @IsInt()
  @Min(0)
  dailyCalories?: number;

  @ApiPropertyOptional({ example: 150 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyProtein?: number;

  @ApiPropertyOptional({ example: 250 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyCarbs?: number;

  @ApiPropertyOptional({ example: 70 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  dailyFat?: number;
}
