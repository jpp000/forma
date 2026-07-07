import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class WorkoutPlanItemDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  exerciseId!: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  sets!: number;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  reps!: number;

  @ApiProperty({ example: 60 })
  @IsInt()
  @Min(0)
  restSeconds!: number;
}

export class CreateWorkoutPlanDto {
  @ApiProperty({ example: 'Push Day' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ type: [WorkoutPlanItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => WorkoutPlanItemDto)
  items!: WorkoutPlanItemDto[];
}
