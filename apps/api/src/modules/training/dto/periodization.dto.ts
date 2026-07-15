import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class PeriodizationBlockDto {
  @ApiProperty()
  @IsString()
  templateId!: string;

  @ApiProperty({ example: 7 })
  @IsInt()
  @Min(1)
  durationDays!: number;
}

export class CreatePeriodizationDto {
  @ApiProperty({ example: 'Hypertrophy block' })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({ type: [PeriodizationBlockDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PeriodizationBlockDto)
  blocks!: PeriodizationBlockDto[];
}

export class AssignPeriodizationDto {
  @ApiProperty()
  @IsString()
  studentUserId!: string;
}
