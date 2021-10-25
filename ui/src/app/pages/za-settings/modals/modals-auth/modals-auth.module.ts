import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login/login.component';
import { SignUpComponent } from './sign-up/sign-up.component';
import { DynamicFormModule } from '../../shared/dynamic-form/dynamic-form.module';
import { SpinnerModule } from 'src/app/shared/components/spinner/spinner.module';
import { ButtonModule } from 'primeng/button';



@NgModule({
  imports: [
    CommonModule,
    DynamicFormModule,
    SpinnerModule,
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
