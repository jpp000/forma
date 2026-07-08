import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateCoachingProfileDto {
  @ApiProperty({ enum: ['trainer', 'nutritionist'] })
  @IsString()
  @IsIn(['trainer', 'nutritionist'])
  type!: 'trainer' | 'nutritionist';

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  credentials!: string;
}
