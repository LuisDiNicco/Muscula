import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticationError } from '../../../domain/errors/authentication.error';
import { AuthorizationError } from '../../../domain/errors/authorization.error';
import { ConflictError } from '../../../domain/errors/conflict.error';
import { EntityNotFoundError } from '../../../domain/errors/entity-not-found.error';
import { ValidationError } from '../../../domain/errors/validation.error';

type ErrorResponse = {
  statusCode: number;
  message: string;
  error: string;
  details?: unknown;
};

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const request = context.getRequest<Request>();
    const response = context.getResponse<Response>();

    if (exception instanceof HttpException) {
      const statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      const details =
        typeof exceptionResponse === 'object' ? exceptionResponse : undefined;

      const body: ErrorResponse = {
        statusCode,
        message: exception.message,
        error: exception.name,
        details,
      };

      response.status(statusCode).json(body);
      return;
    }

    const mapped = this.mapDomainException(exception);
    this.logger.error(
      `[${request.method}] ${request.url} - ${mapped.error}: ${mapped.message}`,
    );
    response.status(mapped.statusCode).json(mapped);
  }

  private mapDomainException(exception: unknown): ErrorResponse {
    if (exception instanceof EntityNotFoundError) {
      return this.makeResponse(
        HttpStatus.NOT_FOUND,
        exception.message,
        'Not Found',
      );
    }

    if (exception instanceof ConflictError) {
      return this.makeResponse(
        HttpStatus.CONFLICT,
        exception.message,
        'Conflict',
      );
    }

    if (exception instanceof ValidationError) {
      return this.makeResponse(
        HttpStatus.BAD_REQUEST,
        exception.message,
        'Bad Request',
      );
    }

    if (exception instanceof AuthenticationError) {
      return this.makeResponse(
        HttpStatus.UNAUTHORIZED,
        exception.message,
        'Unauthorized',
      );
    }

    if (exception instanceof AuthorizationError) {
      return this.makeResponse(
        HttpStatus.FORBIDDEN,
        exception.message,
        'Forbidden',
      );
    }

    return this.makeResponse(
      HttpStatus.INTERNAL_SERVER_ERROR,
      'Internal server error',
      'Internal Server Error',
    );
  }

  private makeResponse(
    statusCode: number,
    message: string,
    error: string,
  ): ErrorResponse {
    return {
      statusCode,
      message,
      error,
    };
  }
}
