import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        message = body;
        error = HttpStatus[statusCode] ?? error;
      } else if (typeof body === 'object' && body !== null) {
        const record = body as Record<string, unknown>;
        error = String(record.error ?? HttpStatus[statusCode] ?? error);
        const rawMessage = record.message;
        if (Array.isArray(rawMessage)) {
          message = rawMessage.map(String);
        } else if (typeof rawMessage === 'string') {
          message = rawMessage;
        }
      }
    }

    void response.status(statusCode).send({ statusCode, message, error });
  }
}
