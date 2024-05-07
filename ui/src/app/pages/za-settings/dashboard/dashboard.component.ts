import { Component } from '@angular/core';
import { SessionService } from 'src/app/services/session/session.service';

@Component({
  selector: 'za-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  isCarSales =
    this.sessionService.isCarSales ||
    this.sessionService.isCarSalesChief ||
    this.sessionService.isCustomerService ||
    this.sessionService.isCustomerServiceChief ||
    this.sessionService.isAdminOrHigher

  constructor(private sessionService: SessionService) { }
}
