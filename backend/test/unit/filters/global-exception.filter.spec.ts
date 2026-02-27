import { GlobalExceptionFilter } from '../../../src/infrastructure/base/filters/global-exception.filter';
import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { EntityNotFoundError } from '../../../src/domain/errors/entity-not-found.error';
import { ConflictError } from '../../../src/domain/errors/conflict.error';
import { ValidationError } from '../../../src/domain/errors/validation.error';
import { AuthenticationError } from '../../../src/domain/errors/authentication.error';
import { AuthorizationError } from '../../../src/domain/errors/authorization.error';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let mockResponse: any;
  let mockArgumentsHost: ArgumentsHost;

  beforeEach(() => {
    filter = new GlobalExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    const mockRequest = {
      url: '/test',
      method: 'GET',
    };

    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    } as unknown as ArgumentsHost;
  });

  it('should map EntityNotFoundError to 404', () => {
    const exception = new EntityNotFoundError('User', '123');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 404,
        message: 'User with id 123 not found',
        error: 'Not Found',
      }),
    );
  });

  it('should map ConflictError to 409', () => {
    const exception = new ConflictError('Email already exists');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 409,
        message: 'Email already exists',
        error: 'Conflict',
      }),
    );
  });

  it('should map ValidationError to 400', () => {
    const exception = new ValidationError('Invalid input');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        message: 'Invalid input',
        error: 'Bad Request',
      }),
    );
  });

  it('should map AuthenticationError to 401', () => {
    const exception = new AuthenticationError('Invalid credentials');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 401,
        message: 'Invalid credentials',
        error: 'Unauthorized',
      }),
    );
  });

  it('should map AuthorizationError to 403', () => {
    const exception = new AuthorizationError('Insufficient permissions');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 403,
        message: 'Insufficient permissions',
        error: 'Forbidden',
      }),
    );
  });

  it('should map unknown errors to 500', () => {
    const exception = new Error('Unexpected error');

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        message: 'Internal server error',
        error: 'Internal Server Error',
      }),
    );
  });
});
