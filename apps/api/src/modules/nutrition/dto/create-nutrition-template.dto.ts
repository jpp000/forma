import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateNutritionTemplateDto {
  @ApiProperty({ example: 'Cut macros' })
  @IsString()
  @MinLength(1)
  name!: string;

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

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  menuJson?: Record<string, unknown>;
}
