import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

export interface ApiSuccessResponse<T> {
  success: true
  statusCode: number
  data: T
}

/**
 * Wraps every successful response into { success: true, statusCode, data }.
 * Register globally in main.ts: app.useGlobalInterceptors(new TransformInterceptor())
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiSuccessResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<ApiSuccessResponse<T>> {
    const statusCode = context.switchToHttp().getResponse().statusCode

    return next.handle().pipe(
      map((data) => ({
        success: true,
        statusCode,
        data,
      })),
    )
  }
}


// ye code NestJS me ek global interceptor (TransformInterceptor) banata hai jo har successful API response ko ek consistent format me wrap karta hai. Matlab controller jo bhi data return karega, interceptor usko transform karke client ko { success: true, statusCode, data } structure me bhejega. Isse poori API ka response format standardized ho jata hai.