import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
  code?: string;
  missingDocumentTypes?: unknown;
}

/**
 * Catches all exceptions and formats them into a consistent ApiErrorResponse.
 * Register globally in main.ts: app.useGlobalFilters(new HttpExceptionFilter())
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let error = 'InternalServerError';
    let code: string | undefined;
    let missingDocumentTypes: unknown;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const res = exceptionResponse as Record<string, unknown>;
        message = (res.message as string | string[]) ?? message;
        error = (res.error as string) ?? exception.name;
        if (typeof res.code === 'string') code = res.code;
        if (res.missingDocumentTypes !== undefined)
          missingDocumentTypes = res.missingDocumentTypes;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
      this.logger.error(
        `Unhandled error: ${exception.message}`,
        exception.stack,
      );
    }

    const body: ApiErrorResponse = {
      success: false,
      statusCode: status,
      message,
      error,
      path: request.url,
      timestamp: new Date().toISOString(),
      ...(code && { code }),
      ...(missingDocumentTypes !== undefined && { missingDocumentTypes }),
    };

    response.status(status).json(body);
  }
}

// ye code NestJS me ek Global Exception Filter banata hai jo backend me aane wali saari errors ko ek consistent API response format me convert karta hai. Matlab chahe controller, guard, service ya kisi aur layer me error aaye, client ko same structured JSON response milega instead of random error formats.
