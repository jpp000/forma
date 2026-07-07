import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateExerciseDto {
  @ApiProperty({ example: 'Barbell Squat' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'legs' })
  @IsString()
  @IsNotEmpty()
  muscleGroup!: string;

  @ApiProperty({ example: 'barbell' })
  @IsString()
  @IsNotEmpty()
  equipment!: string;
}
