import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';
import {
  EmailAlreadyInUseException,
  EmailDeliveryException,
  InvalidVerificationCodeException,
  UserNotFoundException,
  VerificationCodeExpiredException,
  InvalidPreferredCurrencyException,
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
    if (
      exception instanceof EmailAlreadyInUseException ||
      (exception instanceof Error &&
        exception.name === 'EmailAlreadyInUseException') ||
      isUniqueViolation(exception)
    ) {
      return response
        .status(HttpStatus.CONFLICT)
        .json({ message: 'Email already in use' });
    }
    if (
      exception instanceof UserNotFoundException ||
      (exception instanceof Error && exception.name === 'UserNotFoundException')
    ) {
      return response
        .status(HttpStatus.UNAUTHORIZED)
        .json({ message: 'Email not found' });
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
      exception instanceof Error &&
      (exception.message === 'Invalid email' ||
        exception.message === 'Name is required' ||
        exception.message === 'Preferred currency is required')
    ) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: exception.message });
    }
    if (
      exception instanceof InvalidPreferredCurrencyException ||
      (exception instanceof Error &&
        exception.message === 'Invalid preferred currency')
    ) {
      return response
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Invalid preferred currency' });
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message });
  }
}

function isUniqueViolation(exception: unknown): boolean {
  if (!(exception instanceof QueryFailedError)) {
    return false;
  }
  const driverError = exception.driverError as { code?: string } | undefined;
  return driverError?.code === '23505';
}
