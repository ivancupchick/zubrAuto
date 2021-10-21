import { NgModule } from '@angular/core';
import { SpinnerComponent } from './spinner.component';
import { ProgressSpinnerModule } from 'primeng/progressspinner';



@NgModule({
  imports: [
    ProgressSpinnerModule
  ],
  declarations: [
    SpinnerComponent
  ],
  exports: [
    SpinnerComponent
  ],
  entryComponents: [
    SpinnerComponent
  ]
})
export class SpinnerModule { }
