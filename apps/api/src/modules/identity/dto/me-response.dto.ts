import { ApiProperty } from '@nestjs/swagger';
import { Role } from '@forma/types';

export class MeResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: Role, isArray: true })
  roles!: Role[];
}
