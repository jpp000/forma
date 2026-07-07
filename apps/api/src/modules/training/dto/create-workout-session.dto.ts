import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

export class SessionSetDto {
  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(1)
  reps!: number;

  @ApiProperty({ example: 60 })
  @IsNumber()
  @Min(0)
  weightKg!: number;
}

export class SessionExerciseDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  exerciseId!: string;

  @ApiProperty({ type: [SessionSetDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SessionSetDto)
  sets!: SessionSetDto[];
}

export class CreateWorkoutSessionDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  planId?: string;

  @ApiProperty({ example: '2026-07-07T18:00:00.000Z' })
  @IsDateString()
  completedAt!: string;

  @ApiProperty({ type: [SessionExerciseDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SessionExerciseDto)
  exercises!: SessionExerciseDto[];
}
