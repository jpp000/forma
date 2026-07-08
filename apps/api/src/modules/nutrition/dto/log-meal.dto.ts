import { MealType } from '@forma/types';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class MealItemDto {
  @ApiProperty({ example: 'Chicken breast' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 250 })
  @IsNumber()
  @Min(0)
  calories!: number;

  @ApiProperty({ example: 45 })
  @IsNumber()
  @Min(0)
  protein!: number;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  carbs!: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  fat!: number;
}

export class LogMealDto {
  @ApiProperty({ enum: MealType })
  @IsEnum(MealType)
  mealType!: MealType;

  @ApiProperty({ example: '2026-07-07' })
  @IsDateString()
  date!: string;

  @ApiProperty({ type: [MealItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => MealItemDto)
  items!: MealItemDto[];
}
