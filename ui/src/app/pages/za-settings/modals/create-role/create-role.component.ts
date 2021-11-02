import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldType, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerRole } from 'src/app/entities/role';
import { RoleService } from 'src/app/services/role/role.service';
import { DynamicFieldControlService } from '../../shared/dynamic-form/dynamic-field-control.service';
import { DynamicFieldBase } from '../../shared/dynamic-form/dynamic-fields/dynamic-field-base';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'za-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss'],
  providers: [
    DynamicFieldControlService
  ]
})
export class CreateRoleComponent implements OnInit {
  loading = false;

  @Input() role: ServerRole.GetResponse | undefined = undefined;
  @Input() fieldConfigs: ServerField.Entity[] = [];

  formValid = false;

  dynamicFormFields: DynamicFieldBase<string>[] = [];

  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  constructor(
    private roleService: RoleService,
    private dfcs: DynamicFieldControlService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    this.role = this.config?.data?.role || undefined;
  }

  ngOnInit(): void {

    this.fieldConfigs = this.config.data.fieldConfigs;

    const formFields = [];

    formFields.push(this.dfcs.getDynamicFieldFromOptions({
      id: -1,
      value: this.role?.systemName || '',
      key: 'systemName',
      label: 'Системное имя',
      order: 1,
      controlType: FieldType.Text
    }))

    this.dynamicFormFields = formFields;
  }

  create() {
    this.loading = true;

    console.log(this.dynamicForm.getValue());

    const fields = this.dynamicForm.getValue();

    const systemName = fields.find(f => f.name === 'systemName')?.value || '';
    const role: ServerRole.CreateRequest = {
      systemName,
      accesses: []
    }

    const methodObs = this.role != undefined
      ? this.roleService.updateRole(role, (this.role as ServerRole.GetResponse).id)
      : this.roleService.createRole(role)

    methodObs.subscribe(result => {
      if (result) {
        this.ref.close(true);
      } else {
        alert(!!this.role ? 'Роль не обновлена' : 'Роль не создана');
        this.loading = false;
      }
    })
  }

  cancel() {
    this.ref.close(false);
  }

  setValidForm(value: boolean) {
    this.formValid = value;
  }
}
