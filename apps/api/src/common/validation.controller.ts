import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { EchoBodyDto } from './dto/echo-body.dto';

@ApiTags('platform')
@Controller('platform')
export class ValidationController {
  @Post('echo')
  echo(@Body() body: EchoBodyDto) {
    return { ok: true, email: body.email };
  }

  @Get('unauthorized-sample')
  unauthorizedSample() {
    throw new UnauthorizedException('errors.unauthorized');
  }
}
