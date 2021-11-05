import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServerAuth } from 'src/app/entities/user';
import { SessionService } from 'src/app/services/session/session.service';
import { LoginComponent } from '../modals/modals-auth/login/login.component';
import { SignUpComponent } from '../modals/modals-auth/sign-up/sign-up.component';
import { ActionsItem, ActionsService } from './actions.service';

@Component({
  selector: 'za-setting-header',
  templateUrl: './setting-header.component.html',
  styleUrls: ['./setting-header.component.scss'],
  providers: [
    DialogService,
    ActionsService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingHeaderComponent implements OnInit, OnDestroy {
  @Input() user: ServerAuth.IPayload | null = null;

  readonly actions: ActionsItem[] = this.actionsService.getActions();

  destroyed = new Subject();

  constructor(
    private dialogService: DialogService,
    public sessionService: SessionService,
    private actionsService: ActionsService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.sessionService.userSubj
      .pipe(
        takeUntil(this.destroyed)
      )
      .subscribe(user => {
        this.user = user;
        this.rebuildActions();
      });

  }

  login() {
    const ref = this.dialogService.open(LoginComponent, {
      header: 'Войти',
      width: '40%'
    });
  }

  signUp() {
    const ref = this.dialogService.open(SignUpComponent, {
      header: 'Регистрация',
      width: '40%'
    });
  }

  logOut() {
    this.sessionService.logout().subscribe();
  }

  ngOnDestroy() {
    this.destroyed.next();
  }

  rebuildActions() {;
    this.cdr.detectChanges();
  }
}
