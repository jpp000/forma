import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class EchoBodyDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'validation.email' })
  email!: string;
}
