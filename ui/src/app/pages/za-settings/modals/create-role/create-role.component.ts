import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldType, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerRole } from 'src/app/entities/role';
import { RoleService } from 'src/app/services/role/role.service';
import { DynamicFieldControlService } from '../../shared/dynamic-form/dynamic-field-control.service';
import { DynamicFieldBase } from '../../shared/dynamic-form/dynamic-fields/dynamic-field-base';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { finalize } from 'rxjs';
import { ButtonDirective } from 'primeng/button';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'za-create-role',
  templateUrl: './create-role.component.html',
  styleUrls: ['./create-role.component.scss'],
  standalone: true,
  imports: [DynamicFormComponent, SpinnerComponent, ButtonDirective],
})
export class CreateRoleComponent implements OnInit {
  loading = false;

  @Input() role: ServerRole.Response | undefined = undefined;
  @Input() fieldConfigs: ServerField.Response[] = [];

  formValid = false;

  dynamicFormFields: DynamicFieldBase<string>[] = [];

  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  constructor(
    private roleService: RoleService,
    private dfcs: DynamicFieldControlService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ) {
    this.role = this.config?.data?.role || undefined;
  }

  ngOnInit(): void {
    this.fieldConfigs = this.config.data.fieldConfigs;

    const formFields: DynamicFieldBase<string>[] = [];

    formFields.push(
      this.dfcs.getDynamicFieldFromOptions({
        id: -1,
        value: this.role?.systemName || '',
        key: 'systemName',
        label: 'Системное имя',
        order: 1,
        controlType: FieldType.Text,
      }),
    );

    this.dynamicFormFields = formFields;
  }

  create() {
    this.loading = true;

    const fields = this.dynamicForm.getValue();

    const systemName = fields.find((f) => f.name === 'systemName')?.value || '';
    const role: ServerRole.CreateRequest = {
      systemName,
      accesses: [],
    };

    const methodObs =
      this.role != undefined
        ? this.roleService.updateRole(
            role,
            (this.role as ServerRole.Response).id,
          )
        : this.roleService.createRole(role);

    methodObs
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((result) => {
        if (result) {
          this.ref.close(true);
        } else {
          alert(!!this.role ? 'Роль не обновлена' : 'Роль не создана');
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
