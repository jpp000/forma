import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { I18nService, type SupportedLocale } from '../i18n/i18n.service';

@Injectable()
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly i18n: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest<{
      headers: Record<string, string | string[] | undefined>;
    }>();
    const acceptLanguage = request.headers['accept-language'];
    const lang = this.i18n.resolveLanguage(
      Array.isArray(acceptLanguage) ? acceptLanguage[0] : acceptLanguage,
    );

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = this.i18n.t('errors.internal', lang);
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = this.localizeMessage(body, lang);
        error = HttpStatus[statusCode] ?? error;
      } else if (typeof body === 'object' && body !== null) {
        const record = body as Record<string, unknown>;
        error = String(record.error ?? HttpStatus[statusCode] ?? error);
        const rawMessage = record.message;
        if (Array.isArray(rawMessage)) {
          message = rawMessage.map((item) =>
            this.localizeMessage(String(item), lang),
          );
        } else         if (typeof rawMessage === 'string') {
          message = this.localizeMessage(rawMessage, lang);
        }

        const payload: Record<string, unknown> = {
          statusCode,
          message,
          error,
        };
        if (record.upgradeUrl) {
          payload.upgradeUrl = record.upgradeUrl;
        }

        void response.status(statusCode).send(payload);
        return;
      }
    }

    void response.status(statusCode).send({ statusCode, message, error });
  }

  private localizeMessage(text: string, lang: SupportedLocale): string {
    if (text.includes('.')) {
      const translated = this.i18n.t(text, lang);
      if (translated !== text) {
        return translated;
      }
    }

    return text;
  }
}
