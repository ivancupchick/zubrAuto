import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChangeLogComponent } from './change-log.component';
import { RouterModule, Routes } from '@angular/router';
import { PageagleGridComponent } from '../../shared/pageagle-grid/pageagle-grid.component';
import { ToolbarModule } from 'primeng/toolbar';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { ChangeLogDataService } from './services/change-log-data.service';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';

const routes: Routes = [
  {
    path: '',
    component: ChangeLogComponent,
  },
];

@NgModule({
  declarations: [ChangeLogComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    PageagleGridComponent,
    ToolbarModule,
    SpinnerComponent,
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    CalendarModule,
    CheckboxModule,
  ],
})
export class ChangeLogModule {}
