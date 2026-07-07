import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/auth.guard';
import { CurrentUser } from '../../common/current-user.decorator';
import { I18nService } from '../../i18n/i18n.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { MeResponseDto } from './dto/me-response.dto';
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

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({ type: MeResponseDto })
  async me(@CurrentUser() user: { id: string }): Promise<MeResponseDto> {
    return this.identityService.getMe(user.id);
  }
}
