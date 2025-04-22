import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ServerAuth } from 'src/app/entities/user';
import { SessionService } from 'src/app/services/session/session.service';
import { LoginFormComponent } from '../pages/login-form/login-form.component';
import { DashboardComponent } from '../dashboard/dashboard.component';

@Component({
  selector: 'za-settings-home',
  templateUrl: './settings-home.component.html',
  styleUrls: ['./settings-home.component.scss'],
  standalone: true,
  imports: [DashboardComponent, LoginFormComponent],
})
export class SettingsHomeComponent implements OnInit, OnDestroy {
  user: ServerAuth.IPayload | null = null;

  destroyed = new Subject();
  constructor(private sessionService: SessionService) {}

  ngOnInit(): void {
    this.sessionService.userSubj
      .pipe(takeUntil(this.destroyed))
      .subscribe((user) => {
        this.user = user;
      });
  }

  ngOnDestroy() {
    this.destroyed.next(null);
  }
}
