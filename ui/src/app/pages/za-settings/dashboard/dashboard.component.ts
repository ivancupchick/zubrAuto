import { Component } from '@angular/core';
import { SessionService } from 'src/app/services/session/session.service';
import { ClientNextActionDashletComponent } from './dashlets/client-next-action-dashlet/client-next-action-dashlet.component';
import { CallsDashletComponent } from './dashlets/calls-dashlet/calls-dashlet.component';
import { CallRequestsDashletComponent } from './dashlets/call-requests-dashlet/call-requests-dashlet.component';

@Component({
  selector: 'za-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CallRequestsDashletComponent,
    CallsDashletComponent,
    ClientNextActionDashletComponent,
  ],
})
export class DashboardComponent {
  isCarSalesOrAdmin =
    this.sessionService.isCarSales ||
    this.sessionService.isCarSalesChief ||
    this.sessionService.isCustomerService ||
    this.sessionService.isCustomerServiceChief ||
    this.sessionService.isAdminOrHigher;

  constructor(private sessionService: SessionService) {}
}
