import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Validators } from '@angular/forms';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { FieldType } from 'src/app/entities/field';
import { SessionService } from 'src/app/services/session/session.service';
import { DynamicFieldControlService } from '../../../shared/dynamic-form/dynamic-field-control.service';
import { DynamicFieldBase } from '../../../shared/dynamic-form/dynamic-fields/dynamic-field-base';
import { DynamicFormComponent } from '../../../shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'za-sign-up',
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.scss'],
  providers: [
    SessionService,
    DynamicFieldControlService
  ]
})
export class SignUpComponent implements OnInit {
  loading = false;

  formValid = false;

  dynamicFormFields: DynamicFieldBase<string>[] = [];

  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  constructor(
    private sessionService: SessionService,
    private dfcs: DynamicFieldControlService,

    private ref: DynamicDialogRef
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
        type: 'email'
      }),
      this.dfcs.getDynamicFieldFromOptions({
        id: 2,
        value: '',
        key: 'password',
        label: 'Пароль',
        order: 2,
        required: true,
        controlType: FieldType.Text,
        type: 'password'
      })
    ];

    this.dynamicFormFields = formFields;
  }

  signUp() {
    this.loading = true;

    const fields = this.dynamicForm.getValue();
    const email = fields.find(f => f.name === 'email')?.value || '';
    const password = fields.find(f => f.name === 'password')?.value || '';

    this.sessionService.registration(email, password)
      .pipe(
        catchError((err: any, c) => {
          if (err instanceof HttpErrorResponse) {
            alert(err.message);
          }

          return of(null);
        })
      )
      .subscribe(res => {
        this.loading = false;

        if (res) {
          alert('Вы зарегистрировались!');
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
