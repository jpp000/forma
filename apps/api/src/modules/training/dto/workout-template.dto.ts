import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class TemplateExerciseItemDto {
  @ApiProperty({ example: 'Bench Press' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'chest' })
  @IsString()
  @IsNotEmpty()
  muscleGroup!: string;

  @ApiProperty({ example: 'barbell' })
  @IsString()
  @IsNotEmpty()
  equipment!: string;

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

export class CreateWorkoutTemplateDto {
  @ApiProperty({ example: 'Push Day A' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ type: [TemplateExerciseItemDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TemplateExerciseItemDto)
  items!: TemplateExerciseItemDto[];
}

export class UpdateWorkoutTemplateDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({ type: [TemplateExerciseItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TemplateExerciseItemDto)
  items?: TemplateExerciseItemDto[];
}
