import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class CreateLinkRequestDto {
  @ApiProperty({ example: 'cuid_of_professional_user' })
  @IsString()
  @MinLength(1)
  professionalUserId!: string;
}
