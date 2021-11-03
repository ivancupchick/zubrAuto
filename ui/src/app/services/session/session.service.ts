import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerAuth, ServerUser } from 'src/app/entities/user';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SessionService {
  isAuth = false;

  userSubj = new BehaviorSubject<ServerAuth.IPayload | null>(null);

  constructor(private authService: AuthService) {}

  setAuth(isAuth: boolean) {
    this.isAuth = isAuth;
  }

  setUser(user: ServerAuth.IPayload | null) {
    this.userSubj.next(user);
  }

  login(email: string, password: string) {
    return this.authService.login(email, password)
      .pipe(map((res) => {
        localStorage.setItem('token', res.accessToken);
        this.setAuth(true);
        this.setUser(res.user);
        return res;
      }))
  }

  registration(email: string, password: string) {
    return this.authService.registration(email, password)
      .pipe(map((res) => {
        localStorage.setItem('token', res.accessToken);
        this.setAuth(true);
        this.setUser(res.user);
        return res;
      }))
  }

  logout() {
    return this.authService.logout()
      .pipe(map(res => {
        localStorage.removeItem('token');
        this.setAuth(false);
        this.setUser(null);
        return res;
      }))
  }

  checkAuth() {
    return this.authService.refresh()
      .pipe(map((res) => {
        localStorage.setItem('token', res.accessToken);
        this.setAuth(true);
        this.setUser(res.user);
        return res;
      }))
  }
}
