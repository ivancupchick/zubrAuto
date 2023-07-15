import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, catchError, of, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable()
export class ServerErrorMessageInterceptor implements HttpInterceptor {

  constructor(private messageService: MessageService) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if(error.status === 400){
            this.messageService.add({ 
              severity: 'error', 
              summary: error.error.message, 
              detail: ' Не корректное поле: ' + error.error.errors.map((item: ValidationError) => item.param).join(', ')
            });
        }
        console.warn(error)
        return throwError(() => error);
      })
    );
  }
}

export interface ValidationError {
  value: string,
  msg: string,
  param: string,
  location: string
}
