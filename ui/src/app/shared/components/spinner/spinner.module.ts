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
    ]
})
export class SpinnerModule { }
