import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { finalize, catchError, of } from 'rxjs';
import { FieldType } from 'src/app/entities/field';
import { SessionService } from 'src/app/services/session/session.service';
import { DynamicFieldBase } from '../../shared/dynamic-form/dynamic-fields/dynamic-field-base';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { DynamicFormModule } from '../../shared/dynamic-form/dynamic-form.module';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'za-login-form',
  standalone: true,
  imports: [
    SpinnerComponent,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    InputTextModule,
  ],
  templateUrl: './login-form.component.html',
  styleUrl: './login-form.component.scss',
})
export class LoginFormComponent {
  loading = false;

  form = new FormGroup({
    email: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl<string>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  constructor(private sessionService: SessionService) {}

  login() {
    if (this.form.invalid) {
      this.form.get('email')?.markAsDirty();
      this.form.get('password')?.markAsDirty();
      return;
    }

    this.loading = true;

    this.sessionService
      .login(this.form.getRawValue())
      .pipe(
        finalize(() => (this.loading = false)),
        catchError((err: any, c) => {
          if (err instanceof HttpErrorResponse) {
            alert(err.message);
          }

          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          alert('Вы залогинились!');
        }
      });
  }
}
