import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import type { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ApiSuccessResponse<T> {
  success: true;
  statusCode: number;
  data: T;
}

/**
 * Wraps every successful response into { success: true, statusCode, data }.
 * Register globally in main.ts: app.useGlobalInterceptors(new TransformInterceptor())
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<
  T,
  ApiSuccessResponse<T>
> {
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    const res = context.switchToHttp().getResponse<Response>();
    const statusCode = res.statusCode;

    return next.handle().pipe(
      map((data: T) => ({
        success: true as const,
        statusCode,
        data,
      })),
    );
  }
}

// ye code NestJS me ek global interceptor (TransformInterceptor) banata hai jo har successful API response ko ek consistent format me wrap karta hai. Matlab controller jo bhi data return karega, interceptor usko transform karke client ko { success: true, statusCode, data } structure me bhejega. Isse poori API ka response format standardized ho jata hai.
