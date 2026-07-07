import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateStudentProfileDto {
  @ApiProperty({ example: 28 })
  @IsInt()
  @Min(13)
  @Max(120)
  age!: number;

  @ApiProperty({ example: 'female', enum: ['male', 'female', 'other'] })
  @IsIn(['male', 'female', 'other'])
  sex!: string;

  @ApiProperty({ example: 170 })
  @IsNumber()
  @Min(50)
  @Max(250)
  heightCm!: number;

  @ApiProperty({
    example: 'moderate',
    enum: ['sedentary', 'light', 'moderate', 'active', 'very_active'],
  })
  @IsIn(['sedentary', 'light', 'moderate', 'active', 'very_active'])
  activityLevel!: string;
}
