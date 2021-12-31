import { Injectable } from '@angular/core';
import {
  Router, Resolve,
  RouterStateSnapshot,
  ActivatedRouteSnapshot
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ServerAuth, ServerUser } from 'src/app/entities/user';
import { SessionService } from 'src/app/services/session/session.service';

@Injectable()
export class SettingsResolver implements Resolve<ServerAuth.IPayload | null> {
  constructor(private sessionService: SessionService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ServerAuth.IPayload | null> {
    return this.sessionService.checkAuth().pipe(
      map(res => {
        if (!!res.user) {
          return res.user;
        }
        return null;
      }),
      catchError((err: any, c) => {
        // TODO: Add notification of server errors

        return of(null);
      })
    );

  }
}
