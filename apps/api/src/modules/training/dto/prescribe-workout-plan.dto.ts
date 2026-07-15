import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { TemplateExerciseItemDto } from './workout-template.dto';

export class PrescribeWorkoutPlanDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  studentUserId!: string;

  @ApiPropertyOptional({
    description: 'Prescribe from an owned template (copies items)',
  })
  @IsOptional()
  @IsString()
  templateId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ type: [TemplateExerciseItemDto] })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => TemplateExerciseItemDto)
  items?: TemplateExerciseItemDto[];
}
