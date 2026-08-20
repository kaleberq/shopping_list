import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import {
  EmailAlreadyInUseException,
  EmailDeliveryException,
  EmailNotFoundException,
  InvalidEmailException,
  InvalidPlanIdException,
  InvalidPreferredCurrencyException,
  InvalidVerificationCodeException,
  NameRequiredException,
  PreferredCurrencyRequiredException,
  UserNotFoundException,
  VerificationCodeExpiredException,
} from '../../../../domain/exception/identity.exceptions';

@Catch()
export class AuthExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof InvalidVerificationCodeException) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: exception.message });
    }
    if (exception instanceof VerificationCodeExpiredException) {
      return response
        .status(HttpStatus.GONE)
        .json({ message: exception.message });
    }
    if (exception instanceof EmailAlreadyInUseException) {
      return response
        .status(HttpStatus.CONFLICT)
        .json({ message: exception.message });
    }
    if (exception instanceof EmailNotFoundException) {
      return response
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: exception.message });
    }
    if (exception instanceof UserNotFoundException) {
      return response
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: exception.message });
    }
    if (exception instanceof EmailDeliveryException) {
      return response
        .status(HttpStatus.SERVICE_UNAVAILABLE)
        .json({ message: exception.message });
    }
    if (exception instanceof BadRequestException) {
      const body = exception.getResponse();
      const message =
        typeof body === 'string'
          ? body
          : Array.isArray((body as { message?: unknown }).message)
            ? String((body as { message: string[] }).message[0])
            : ((body as { message?: string }).message ?? 'Validation failed');
      return response.status(HttpStatus.BAD_REQUEST).json({ message });
    }
    if (
      exception instanceof InvalidEmailException ||
      exception instanceof NameRequiredException ||
      exception instanceof PreferredCurrencyRequiredException ||
      exception instanceof InvalidPreferredCurrencyException ||
      exception instanceof InvalidPlanIdException
    ) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: exception.message });
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message });
  }
}
