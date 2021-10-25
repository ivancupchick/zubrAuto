import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { catchError, filter, map, switchMap, take, tap } from "rxjs/operators";
import { SessionService } from "../services/session/session.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string>('');

  constructor(private sessionService: SessionService) {}

  //test this duration accesstoken = 15s, duration refreshtoken = 30s,
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('token');

    const request = accessToken ? this.addToken(req, accessToken) : req;

    return next.handle(request)
      .pipe(
        // map((result => {
        //   console.log(result);
        //   return result;
        // })),
        catchError((err, caught) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              return this.handle401Error(request, next);
            } else {
              throw err;
              // return throwError(error);
            }
          }
          throw err;
        })
      );

    // return next.handle(request)
    //   .pipe(
    //     tap(
    //       (event) => {
    //         if (event instanceof HttpResponse)
    //           console.log('Server response')
    //         },
    //       (err) => {
    //         if (err instanceof HttpErrorResponse) {
    //           if (err.status == 401 && !(originalReq as any)._isRetry) {
    //             console.log('Unauthorized');
    //             (originalReq as any)._isRetry = true; //test this


    //             this.sessionService.checkAuth()
    //               .subscribe(arg => {
    //                 next.handle(originalReq); // maybe authReq
    //               });

    //             return;
    //           }

    //           throw err;
    //         }
    //       }
    //     )
    //   );
  }

  private addToken(req: HttpRequest<any>, token: string) {
    return req.clone({
      withCredentials: true, // replace to base interceptor
      headers: req.headers.set(
        'Authorization',
        token
      )
    });
  }

  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next('');

      return this.sessionService.checkAuth().pipe(
        switchMap((token) => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(token.accessToken);
          return next.handle(this.addToken(request, token.accessToken));
        }));
    } else {
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(accessToken => {
          return accessToken ? next.handle(this.addToken(request, accessToken)) : next.handle(request);
        }));
    }
  }
}
