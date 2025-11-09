// src/utils/app-error.utils.ts

import { HTTP_STATUS_CODE, HTTP_STATUS_CODE_TYPE } from '../config/http.config';
import { ERROR_CODE_ENUM, ERROR_CODE_ENUM_TYPE } from '../enums/error-code.enum';

export class AppError extends Error {
  public readonly httpStatusCode: HTTP_STATUS_CODE_TYPE;
  public readonly errorCode: ERROR_CODE_ENUM_TYPE;
  public readonly isOperational: boolean;
  public details?: unknown;

  constructor(
    message: string,
    httpStatusCode: HTTP_STATUS_CODE_TYPE = HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
    errorCode: ERROR_CODE_ENUM_TYPE = ERROR_CODE_ENUM.INTERNAL_SERVER_ERROR,
    details?: unknown,
    isOperational = true,
  ) {
    super(message);
    this.httpStatusCode = httpStatusCode;
    this.errorCode = errorCode;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class HttpException extends AppError {
  constructor(
    message: string,
    statusCode: HTTP_STATUS_CODE_TYPE,
    errorCode: ERROR_CODE_ENUM_TYPE = ERROR_CODE_ENUM.UNKNOWN_ERROR,
  ) {
    super(message, statusCode, errorCode);
  }
}

export class BadRequestException extends AppError {
  constructor(
    message = 'Bad Request',
    errorCode: ERROR_CODE_ENUM_TYPE = ERROR_CODE_ENUM.VALIDATION_ERROR,
    details?: unknown,
  ) {
    super(
      message,
      HTTP_STATUS_CODE.BAD_REQUEST,
      errorCode || ERROR_CODE_ENUM.VALIDATION_ERROR,
      details,
    );
  }
}

export class UnauthorizedException extends AppError {
  constructor(
    message = 'Unauthorized',
    errorCode: ERROR_CODE_ENUM_TYPE = ERROR_CODE_ENUM.AUTH_UNAUTHORIZED,
  ) {
    super(message, HTTP_STATUS_CODE.UNAUTHORIZED, errorCode);
  }
}

export class ForbiddenException extends AppError {
  constructor(message = 'Forbidden', errorCode: ERROR_CODE_ENUM_TYPE = ERROR_CODE_ENUM.FORBIDDEN) {
    super(message, HTTP_STATUS_CODE.FORBIDDEN, errorCode);
  }
}

export class NotFoundException extends AppError {
  constructor(
    message = 'Resource Not Found',
    errorCode: ERROR_CODE_ENUM_TYPE = ERROR_CODE_ENUM.RESOURCE_NOT_FOUND,
  ) {
    super(message, HTTP_STATUS_CODE.NOT_FOUND, errorCode);
  }
}

export class ConflictException extends AppError {
  constructor(message = 'Conflict', errorCode: ERROR_CODE_ENUM_TYPE = ERROR_CODE_ENUM.CONFLICT) {
    super(message, HTTP_STATUS_CODE.CONFLICT, errorCode);
  }
}

export class InternalServerException extends AppError {
  constructor(
    message = 'Internal Server Error',
    errorCode: ERROR_CODE_ENUM_TYPE = ERROR_CODE_ENUM.INTERNAL_SERVER_ERROR,
  ) {
    super(message, HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR, errorCode);
  }
}
