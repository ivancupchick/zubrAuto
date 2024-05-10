import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, filter, map, switchMap, take, tap } from "rxjs/operators";
import { SessionService } from "../services/session/session.service";
import { Router } from "@angular/router";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string>('');

  constructor(private sessionService: SessionService, private router: Router) {}

  // TODO! check this with parametrs: accesstoken duration = 15s, refreshtoken duration = 30s,
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('token');

    const request = accessToken ? this.addToken(req, accessToken) : req;

    return next.handle(request)
      .pipe(
        catchError((err, caught) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              return this.handle401Error(request, next);
            } else {
              this.router.navigateByUrl('/');

              throw err;
              // return throwError(error);
            }
          }
          this.router.navigateByUrl('/');

          throw err;
        })
      );
  }

  private addToken(req: HttpRequest<any>, token: string) {
    return req.clone({
      withCredentials: true, // replace to base interceptor
      headers: req.headers.set(
        'Authorization',
        `Bearer ${token}`
      )
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next('');

      return this.sessionService.checkAuth().pipe(
        catchError((err, caught) => {
          console.log(2);
          this.router.navigateByUrl('/');

          throw err;
        }),
        switchMap((token) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.accessToken);
          return next.handle(this.addToken(request, token.accessToken));
        }));
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        catchError((err, caught) => {
          console.log(2);

          this.router.navigateByUrl('/');

          throw err;
        }),
        switchMap(accessToken => {
          return accessToken ? next.handle(this.addToken(request, accessToken)) : next.handle(request);
        }));
    }
  }
}
