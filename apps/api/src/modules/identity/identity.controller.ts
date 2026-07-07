import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18nService } from '../../i18n/i18n.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { IdentityService } from './identity.service';

@ApiTags('identity')
@Controller('identity')
export class IdentityController {
  constructor(
    private readonly identityService: IdentityService,
    private readonly i18n: I18nService,
  ) {}

  @Post('otp/request')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({ summary: 'Request email OTP' })
  async requestOtp(
    @Body() body: RequestOtpDto,
    @Headers('accept-language') acceptLanguage?: string,
  ): Promise<void> {
    const lang = this.i18n.resolveLanguage(acceptLanguage);
    await this.identityService.requestOtp(body.email, lang);
  }

  @Post('otp/verify')
  @ApiOperation({ summary: 'Verify email OTP and receive JWT' })
  @ApiOkResponse({ type: AuthResponseDto })
  async verifyOtp(@Body() body: VerifyOtpDto): Promise<AuthResponseDto> {
    return this.identityService.verifyOtp(body.email, body.code);
  }
}
