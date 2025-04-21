import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()
export class AccessTokenInterceptor implements HttpInterceptor {
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    const accessToken = localStorage.getItem('token');

    const request = accessToken ? this.addToken(req, accessToken) : req;

    return next.handle(request)
  }

  private addToken(req: HttpRequest<any>, token: string) {
      return req.clone({
        withCredentials: true, // replace to base interceptor
        headers: req.headers.set('Authorization', `Bearer ${token}`),
      });
  }
}
