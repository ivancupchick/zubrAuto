import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldType, ServerField, UIRealField } from 'src/app/entities/field';
import { FieldNames, StringHash } from 'src/app/entities/FieldNames';
import { ServerUser, SystemRole } from 'src/app/entities/user';
import { ServerRole } from 'src/app/entities/role';
import { UserService } from 'src/app/services/user/user.service';
import { DynamicFieldControlService } from '../../shared/dynamic-form/dynamic-field-control.service';
import { DynamicFieldBase } from '../../shared/dynamic-form/dynamic-fields/dynamic-field-base';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { settingsUsersStrings } from '../../settings-users/settings-users.strings';
import { Validators } from '@angular/forms';

@Component({
  selector: 'za-create-user',
  templateUrl: './create-user.component.html',
  styleUrls: ['./create-user.component.scss'],
  providers: [
    DynamicFieldControlService
  ]
})
export class CreateUserComponent implements OnInit {
  loading = false;

  @Input() user: ServerUser.GetResponse | undefined = undefined;
  @Input() customRoles: ServerRole.GetResponse[] = [];
  @Input() fieldConfigs: ServerField.Entity[] = [];

  formValid = false;

  dynamicFormFields: DynamicFieldBase<string>[] = [];

  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  excludeFields: FieldNames.User[] = [
    // 'roleLevel' as FieldNames.User
    'email' as FieldNames.User,
    'password' as FieldNames.User,
    'roleLevel' as FieldNames.User
  ];

  constructor(
    private userService: UserService,
    private dfcs: DynamicFieldControlService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    this.user = this.config?.data?.user || undefined;
  }

  ngOnInit(): void {

    this.fieldConfigs = this.config.data.fieldConfigs;
    this.customRoles = this.config.data.roles;

    const formFields = this.dfcs.getDynamicFieldsFromDBFields(this.fieldConfigs
      .filter(fc => !this.excludeFields.includes(fc.name as FieldNames.User))
      .map(fc => {
        const fieldValue = !!this.user
          ? this.user.fields.find(f => f.id === fc.id)?.value || ''
          : '';

        const newField = new UIRealField(
          fc,
          fieldValue
        );

        return newField;
      }))
        .map(fc => this.updateFieldConfig(fc));

    formFields.push(this.dfcs.getDynamicFieldFromOptions({
      id: -1,
      value: `${this.user?.email || ''}`,
      key: 'email',
      label: 'Электронная почта',
      order: 1,
      variants: [],
      controlType: FieldType.Text,
      validators: [Validators.email, Validators.required]
    }));
    formFields.push(this.dfcs.getDynamicFieldFromOptions({
      id: -1,
      value: '',
      key: 'password',
      label: 'Пароль',
      order: 1,
      variants: [],
      type: 'password',
      validators: [Validators.required], // Validators.pattern(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/)
      controlType: FieldType.Text,
    }))
    formFields.push(this.dfcs.getDynamicFieldFromOptions({
      id: -1,
      value: `${this.user?.roleLevel || SystemRole.None }`,
      key: 'roleLevel',
      label: 'Роль',
      order: 1,
      variants: [{
        key: `${SystemRole.None}`,
        value: 'Никакой'
      }, {
        key: `${SystemRole.Admin}`,
        value: 'Админ'
      }, {
        key: `${SystemRole.SuperAdmin}`,
        value: 'Супер Админ'
      }, ...this.customRoles.map((role) => {
        return {
          key: `${role.id + 1000}`,
          value: (settingsUsersStrings as StringHash)[role.systemName] || role.systemName
        };
      })],
      controlType: FieldType.Dropdown,
    }))

    this.dynamicFormFields = formFields;
  }

  create() {
    this.loading = true;

    console.log(this.dynamicForm.getValue());

    const fields = this.dynamicForm.getValue();

    const email = fields.find(f => f.name === 'email')?.value || '';
    const password = fields.find(f => f.name === 'password')?.value || '';
    const roleLevel = +(fields.find(f => f.name === 'roleLevel')?.value || '');

    const user: ServerUser.CreateRequest = {
      email,
      password,
      isActivated: true,
      roleLevel,
      fields: fields.filter(fc => !this.excludeFields.includes(fc.name as FieldNames.User))
    }

    const userForUpdate: ServerUser.UpdateRequest = {
      email,
      isActivated: true,
      roleLevel,
      fields: fields.filter(fc => !this.excludeFields.includes(fc.name as FieldNames.User))
    }

    if (password) {
      userForUpdate.password = password
    }

    const methodObs = this.user != undefined
      ? this.userService.updateUser(userForUpdate, (this.user as ServerUser.GetResponse).id)
      : this.userService.createUser(user)

    methodObs.subscribe(result => {
      if (result) {
        this.ref.close(true);
      } else {
        alert(!!this.user ? 'Клиент не обновлён' : 'Клиент не создан');
      }
    })
  }

  cancel() {
    this.ref.close(false);
  }

  setValidForm(value: boolean) {
    this.formValid = value;
  }

  updateFieldConfig(field: DynamicFieldBase<string>) {
    if ((settingsUsersStrings as StringHash)[field.key]) {
      field.label = (settingsUsersStrings as StringHash)[field.key] || 'Default Title';
    }

    console.log(field.key);

    switch (field.key) {
      case FieldNames.User.name:
        field.label = settingsUsersStrings.name;
        break;
      // case FieldNames.User.tradeInAuto:
      //   field.label = settingsUsersStrings.tradeInAuto;
      //   break;
    }

    return field;
  }
}
