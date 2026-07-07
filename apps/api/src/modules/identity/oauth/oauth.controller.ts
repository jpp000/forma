import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { isOAuthProvider } from './oauth.types';
import { OAuthService } from './oauth.service';

@ApiTags('identity')
@Controller('identity/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get(':provider')
  @ApiOperation({ summary: 'Start OAuth flow' })
  async start(
    @Param('provider') providerParam: string,
    @Req() request: FastifyRequest,
    @Res() reply: FastifyReply,
  ): Promise<void> {
    if (!isOAuthProvider(providerParam)) {
      throw new UnauthorizedException('errors.oauth_invalid');
    }

    const protocol = request.protocol;
    const host = request.headers.host ?? 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    const redirectUrl = this.oauthService.getRedirectUrl(providerParam, baseUrl);

    await reply.redirect(redirectUrl, 302);
  }

  @Get(':provider/callback')
  @ApiOperation({ summary: 'OAuth callback' })
  async callback(
    @Param('provider') providerParam: string,
    @Query('mockToken') mockToken: string | undefined,
    @Query('code') code: string | undefined,
  ): Promise<{ accessToken: string }> {
    if (!isOAuthProvider(providerParam)) {
      throw new UnauthorizedException('errors.oauth_invalid');
    }

    return this.oauthService.handleCallback(providerParam, { mockToken, code });
  }
}
