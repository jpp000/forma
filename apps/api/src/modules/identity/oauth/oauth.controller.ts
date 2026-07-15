import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { OAuthService } from './oauth.service';
import { isOAuthProvider } from './oauth.types';

type OAuthRequest = { protocol: string; headers: { host?: string } };
type OAuthReply = {
  redirect: (url: string, statusCode: number) => Promise<void>;
  status: (statusCode: number) => OAuthReply;
  send: (payload: unknown) => Promise<void>;
};

@ApiTags('identity')
@Controller('identity/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get(':provider')
  @ApiOperation({ summary: 'Start OAuth flow' })
  async start(
    @Param('provider') providerParam: string,
    @Query('platform') platform: string | undefined,
    @Req() request: OAuthRequest,
    @Res() reply: OAuthReply,
  ): Promise<void> {
    if (!isOAuthProvider(providerParam)) {
      throw new UnauthorizedException('errors.oauth_invalid');
    }

    const protocol = request.protocol;
    const host = request.headers.host ?? 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const redirectUrl = this.oauthService.getRedirectUrl(
      providerParam,
      baseUrl,
      { platform },
    );

    await reply.redirect(redirectUrl, 302);
  }

  @Get(':provider/callback')
  @ApiOperation({ summary: 'OAuth callback' })
  async callback(
    @Param('provider') providerParam: string,
    @Query('mockToken') mockToken: string | undefined,
    @Query('code') code: string | undefined,
    @Query('platform') platform: string | undefined,
    @Res() reply: OAuthReply,
  ): Promise<void> {
    if (!isOAuthProvider(providerParam)) {
      throw new UnauthorizedException('errors.oauth_invalid');
    }

    const result = await this.oauthService.handleCallback(providerParam, {
      mockToken,
      code,
    });

    if (platform === 'mobile' || platform === 'web') {
      const successUrl =
        platform === 'mobile'
          ? process.env.OAUTH_MOBILE_SUCCESS_URL
          : process.env.OAUTH_WEB_SUCCESS_URL;
      if (!successUrl) {
        throw new BadRequestException(
          platform === 'mobile'
            ? 'errors.oauth_mobile_redirect_missing'
            : 'errors.oauth_web_redirect_missing',
        );
      }

      const redirectTarget = new URL(successUrl);
      redirectTarget.searchParams.set('accessToken', result.accessToken);
      await reply.redirect(redirectTarget.toString(), 302);
      return;
    }

    await reply.status(200).send(result);
  }
}
