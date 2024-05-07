import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { DynamicFormModule } from '../../shared/dynamic-form/dynamic-form.module';
import { ButtonModule } from 'primeng/button';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';



@NgModule({
  imports: [
    CommonModule,
    DynamicFormModule,
    SpinnerComponent,
    ButtonModule
  ],
  declarations: [
    LoginComponent,
    SignUpComponent
  ],
  exports: [
    LoginComponent,
    SignUpComponent
  ]
})
export class ModalsAuthModule { }
