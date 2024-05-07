import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { CallRequestsDashletComponent } from './dashlets/call-requests-dashlet/call-requests-dashlet.component';
import { GridComponent } from '../shared/grid/grid.component';
import { TabViewModule } from 'primeng/tabview';
import { PanelModule } from 'primeng/panel';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';


@NgModule({
  declarations: [
    DashboardComponent,
    CallRequestsDashletComponent
  ],
  imports: [
    CommonModule,
    GridComponent,
    TabViewModule,
    PanelModule,
    SpinnerComponent
  ],
  exports: [
    DashboardComponent
  ]
})
export class DashboardModule { }
