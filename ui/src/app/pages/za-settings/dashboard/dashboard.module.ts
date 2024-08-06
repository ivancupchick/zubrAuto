import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { CallRequestsDashletComponent } from './dashlets/call-requests-dashlet/call-requests-dashlet.component';
import { GridComponent } from '../shared/grid/grid.component';
import { TabViewModule } from 'primeng/tabview';
import { PanelModule } from 'primeng/panel';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { ClientNextActionDashletComponent } from './dashlets/client-next-action-dashlet/client-next-action-dashlet.component';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CallsDashletComponent } from './dashlets/calls-dashlet/calls-dashlet.component';
import { PageagleGridComponent } from '../shared/pageagle-grid/pageagle-grid.component';
import { InputTextModule } from 'primeng/inputtext';


@NgModule({
  declarations: [
    DashboardComponent,
    CallRequestsDashletComponent,
    ClientNextActionDashletComponent,
    CallsDashletComponent
  ],
  imports: [
    CommonModule,
    GridComponent,
    TabViewModule,
    PanelModule,
    SpinnerComponent,
    ButtonModule,
    BadgeModule,
    MultiSelectModule,
    FormsModule,
    ReactiveFormsModule,
    PageagleGridComponent,
    InputTextModule,
  ],
  exports: [
    DashboardComponent
  ]
})
export class DashboardModule { }
