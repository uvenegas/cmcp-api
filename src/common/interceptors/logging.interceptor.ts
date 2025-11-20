import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const user = request.user?.email ?? 'anonymous';
    const now = Date.now();

    console.log(
      `[REQ] ${method} ${url} - user: ${user} - time: ${new Date().toISOString()}`,
    );

    return next.handle().pipe(
      tap(() => {
        console.log(
          `[RES] ${method} ${url} - user: ${user} - total: ${
            Date.now() - now
          }ms`,
        );
      }),
    );
  }
}
