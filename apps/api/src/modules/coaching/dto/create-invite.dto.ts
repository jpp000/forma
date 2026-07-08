import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateInviteDto {
  @ApiProperty({ example: 'student@example.com' })
  @IsEmail()
  studentEmail!: string;
}
