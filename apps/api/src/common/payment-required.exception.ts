import { HttpException, HttpStatus } from '@nestjs/common';

export class PaymentRequiredException extends HttpException {
  constructor(messageKey: string, extras?: Record<string, unknown>) {
    super(
      {
        statusCode: HttpStatus.PAYMENT_REQUIRED,
        message: messageKey,
        error: 'Payment Required',
        ...extras,
      },
      HttpStatus.PAYMENT_REQUIRED,
    );
  }
}
