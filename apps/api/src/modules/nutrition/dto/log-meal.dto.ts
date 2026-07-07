import { MealType } from '@forma/types';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class MealItemDto {
  @ApiProperty({ example: 'Chicken breast' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 165 })
  @IsNumber()
  @Min(0)
  calories!: number;

  @ApiProperty({ example: 31 })
  @IsNumber()
  @Min(0)
  protein!: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  carbs!: number;

  @ApiProperty({ example: 3.6 })
  @IsNumber()
  @Min(0)
  fat!: number;
}

export class LogMealDto {
  @ApiProperty({ enum: MealType })
  @IsEnum(MealType)
  mealType!: MealType;

  @ApiPropertyOptional({ example: '2026-07-07' })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ type: [MealItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  items!: MealItemDto[];
}
