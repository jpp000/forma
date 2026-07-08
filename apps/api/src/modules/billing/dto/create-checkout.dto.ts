import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString } from 'class-validator';

export class CreateCheckoutDto {
  @ApiProperty({ enum: ['student_pro', 'professional'] })
  @IsString()
  @IsIn(['student_pro', 'professional'])
  planSlug!: string;
}
