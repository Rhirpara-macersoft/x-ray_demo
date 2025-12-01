import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { XRayTracingService } from '../services/xray-tracing.service';

@Injectable()
export class XRayInterceptor implements HttpInterceptor {

  constructor(private xrayService: XRayTracingService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Generate trace ID for this request
    const traceHeader = this.xrayService.generateTraceId();
    const startTime = performance.now();

    // Store trace info for this request
    this.xrayService.startTrace(req.url, traceHeader, startTime);

    // Clone request and add X-Ray trace header
    const clonedReq = req.clone({
      setHeaders: {
        'X-Amzn-Trace-Id': traceHeader,
        'X-Client-Start-Time': startTime.toString()
      }
    });

    // Handle response and capture timing
    return next.handle(clonedReq).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const endTime = performance.now();
            const duration = endTime - startTime;

            this.xrayService.endTrace(req.url, {
              status: event.status,
              duration: duration,
              traceId: traceHeader
            });
          }
        },
        error: (error) => {
          const endTime = performance.now();
          const duration = endTime - startTime;

          this.xrayService.endTrace(req.url, {
            status: error.status || 500,
            duration: duration,
            traceId: traceHeader,
            error: error.message
          });
        }
      })
    );
  }
}
