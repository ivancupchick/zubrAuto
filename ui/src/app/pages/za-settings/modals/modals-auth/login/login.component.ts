import { HttpErrorResponse } from '@angular/common/http';
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { FieldType } from 'src/app/entities/field';
import { SessionService } from 'src/app/services/session/session.service';
import { DynamicFieldControlService } from '../../../shared/dynamic-form/dynamic-field-control.service';
import { DynamicFieldBase } from '../../../shared/dynamic-form/dynamic-fields/dynamic-field-base';
import { DynamicFormComponent } from '../../../shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'za-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loading = false;

  formValid = false;

  dynamicFormFields: DynamicFieldBase<string>[] = [];

  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  constructor(
    private sessionService: SessionService,
    private dfcs: DynamicFieldControlService,

    private ref: DynamicDialogRef,
  ) {}

  ngOnInit(): void {
    const formFields = [
      this.dfcs.getDynamicFieldFromOptions({
        id: 1,
        value: '',
        key: 'email',
        label: 'Электронная почта',
        order: 1,
        required: true,
        controlType: FieldType.Text,
        validators: [Validators.email],
        type: 'email',
      }),
      this.dfcs.getDynamicFieldFromOptions({
        id: 2,
        value: '',
        key: 'password',
        label: 'Пароль',
        order: 2,
        required: true,
        controlType: FieldType.Text,
        type: 'password',
      }),
    ];

    this.dynamicFormFields = formFields;
  }

  login() {
    this.loading = true;

    const fields = this.dynamicForm.getValue();
    const email = fields.find((f) => f.name === 'email')?.value || '';
    const password = fields.find((f) => f.name === 'password')?.value || '';

    this.sessionService
      .login({ email, password })
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
          this.ref.close(true);
        }
      });
  }

  cancel() {
    this.ref.close(false);
  }

  setValidForm(value: boolean) {
    this.formValid = value;
  }
}
