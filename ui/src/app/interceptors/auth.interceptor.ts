import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { SessionService } from '../services/session/session.service';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  private refreshTokenSubject = new BehaviorSubject<string>('');
  private logout = new Subject();

  constructor(
    private sessionService: SessionService,
    private messageService: MessageService,
  ) {}

  // TODO! check this with parametrs: accesstoken duration = 15s, refreshtoken duration = 30s, !second interation!
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('token');

    const request = accessToken ? this.addToken(req, accessToken) : req;

    return next.handle(request).pipe(
      takeUntil(this.logout),
      catchError((error, caught) => {
        if (error instanceof HttpErrorResponse) {
          // console.log(error);

          if (error.status === 401 && !error.url?.includes('/auth/refresh')) {
            return this.handle401Error(request, next);
          } else {
            // console.log(3); // expire refresh step1

            if (error.status !== 401) {
              this.showError(error);
            }

            return throwError(() => error);
          }
        }
        // console.log(4);

        if (error.status !== 401) {
          this.showError(error);
        }

        return throwError(() => error);
      }),
    );
  }

  private addToken(req: HttpRequest<any>, token: string) {
    return req.clone({
      withCredentials: true, // replace to base interceptor
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
  }

  private handle401Error(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    this.refreshTokenSubject.next('');

    return this.sessionService.checkAuth().pipe(
      takeUntil(this.logout),
      catchError((error, caught) => {
        // console.log('4.5'); // expire refresh step2

        if (error.status !== 401) {
          this.showError(error);
        }

        return throwError(() => error);
      }),
      switchMap((token) => {
        // console.log(5); // expire access

        this.refreshTokenSubject.next(token.accessToken);
        return next.handle(this.addToken(request, token.accessToken));
      }),
      catchError((error, caught) => {
        if (error.status === 401) {
          this.logout.next(null);
          this.sessionService.zaLogout();
        }

        // console.log(6); // expire refresh step3

        this.showError(error);

        return throwError(() => error);
      }),
    );
  }

  showError(error: HttpErrorResponse) {
    this.messageService.add({
      severity: 'error',
      summary: `${error.name || error.statusText}, code: ${error.status}`,
      detail: `${error.message}`,
      life: 7000,
    });
  }
}
