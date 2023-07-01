import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerRole } from 'src/app/entities/role';
import { LocalStorageKey, ServerAuth } from 'src/app/entities/user';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SessionService {
  get token(): string | null {
    return localStorage.getItem(LocalStorageKey.Token);
  }

  get isAuth(): boolean {
    return this.token !== null
  }

  private selectedRole: ServerRole.Custom | ServerRole.System.SuperAdmin | ServerRole.System.Admin = ServerRole.System.Admin;
  userSubj = new BehaviorSubject<ServerAuth.IPayload | null>(null);
  roleSubj = new Subject<ServerRole.Custom | ServerRole.System.SuperAdmin | ServerRole.System.Admin>();

  private get user() {
    return this.userSubj.getValue() || {} as ServerAuth.IPayload;
  }
  get isAdminOrHigher() {
    return ((this.user.roleLevel === ServerRole.System.Admin || this.user.roleLevel === ServerRole.System.SuperAdmin) && (this.selectedRole === ServerRole.System.Admin)) || false;
  }
  get isRealAdminOrHigher() {
    return this.user.roleLevel === ServerRole.System.Admin || this.user.roleLevel === ServerRole.System.SuperAdmin || false;
  }
  get isContactCenter()        { return this.isCustomRole(ServerRole.Custom.contactCenter); }
  get isContactCenterChief()   { return this.isCustomRole(ServerRole.Custom.contactCenterChief); }
  get isCarShooting()          { return this.isCustomRole(ServerRole.Custom.carShooting); }
  get isCarShootingChief()     { return this.isCustomRole(ServerRole.Custom.carShootingChief); }
  get isCustomerService()      { return this.isCustomRole(ServerRole.Custom.customerService); }
  get isCustomerServiceChief() { return this.isCustomRole(ServerRole.Custom.customerServiceChief); }
  get isCarSales()             { return this.isCustomRole(ServerRole.Custom.carSales); }
  get isCarSalesChief()        { return this.isCustomRole(ServerRole.Custom.carSalesChief); }

  constructor(private authService: AuthService) {}

  private isCustomRole(role: ServerRole.Custom) {
    return this.user.customRoleName === role || (
      this.isRealAdminOrHigher && this.selectedRole === role
    );
  }

  setUser(user: ServerAuth.IPayload | null) {
    this.userSubj.next(user);
  }

  login(email: string, password: string) {
    return this.authService.login(email, password)
      .pipe(map((res) => {
        localStorage.setItem(LocalStorageKey.Token, res.accessToken);
        this.setUser(res.user);
        return res;
      }))
  }

  registration(email: string, password: string) {
    return this.authService.registration(email, password)
      .pipe(map((res) => {
        localStorage.setItem(LocalStorageKey.Token, res.accessToken);
        this.setUser(res.user);
        return res;
      }))
  }

  logout() {
    return this.authService.logout()
      .pipe(map(res => {
        localStorage.removeItem(LocalStorageKey.Token);
        this.setUser(null);
        return res;
      }))
  }

  checkAuth() {
    return this.authService.refresh()
      .pipe(map((res) => {
        localStorage.setItem(LocalStorageKey.Token, res.accessToken);
        this.setUser(res.user);
        return res;
      }))
  }

  setCustomRole(role: ServerRole.Custom | ServerRole.System.SuperAdmin | ServerRole.System.Admin) {
    this.selectedRole = role;
    this.roleSubj.next(role);
  }
}
