import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';

export class LoggingInterceptor implements NestInterceptor {
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    // ---------- BEFORE ROUTE HANDLER ----------

    console.log('Before handling the request');

    const now = Date.now();

    // Continue to the route handler
    return next.handle().pipe(
      // ---------- AFTER ROUTE HANDLER ----------
      tap(() => {
        console.log(
          `🔴 After route handler... Time taken: ${Date.now() - now}ms`,
        );
      }),
    );
  }
}
