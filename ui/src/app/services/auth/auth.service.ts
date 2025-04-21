import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { ServerAuth } from 'src/app/entities/user';
import { environment } from 'src/environments/environment';
import { RequestService } from '../request/request.service';
import { cacheService } from '../request/cache.service';

const API = 'auth';

@Injectable()
export class AuthService {
  constructor(private requestService: RequestService) {}

  login(email: string, password: string) {
    cacheService.dropAllCache();

    return this.requestService
      .post<ServerAuth.AuthGetResponse>(
        `${environment.serverUrl}/${API}/${'login'}`,
        { email, password },
      )
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  registration(email: string, password: string) {
    return this.requestService
      .post<ServerAuth.AuthGetResponse>(
        `${environment.serverUrl}/${API}/${'registration'}`,
        { email, password },
      )
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  logout() {
    return this.requestService
      .post<boolean>(`${environment.serverUrl}/${API}/${'logout'}`, {})
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }

  refresh() {
    return this.requestService
      .get<ServerAuth.AuthGetResponse>(
        `${environment.serverUrl}/${API}/${'refresh'}`,
        {},
      )
      .pipe(
        map((res) => {
          return res;
        }),
      );
  }
}
