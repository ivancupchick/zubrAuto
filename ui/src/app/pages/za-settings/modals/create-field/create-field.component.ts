import { Component, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldDomains, ServerField } from 'src/app/entities/field';
import { FieldService } from 'src/app/services/field/field.service';
import { FieldFormComponent } from '../../shared/fields/field-form/field-form.component';
import { finalize } from 'rxjs';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ButtonDirective } from 'primeng/button';

@Component({
  selector: 'za-create-field',
  templateUrl: './create-field.component.html',
  styleUrls: ['./create-field.component.scss'],
  standalone: true,
  imports: [FieldFormComponent, ButtonDirective, SpinnerComponent],
})
export class CreateFieldComponent implements OnInit {
  loading = false;
  domain!: FieldDomains;

  isEdit = false;
  id!: number;
  field!: ServerField.Response;

  formValid = false;

  @ViewChild(FieldFormComponent) fieldForm!: FieldFormComponent;

  constructor(
    private fieldService: FieldService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
  ) {}

  ngOnInit(): void {
    this.domain = this.config.data.domain;
    this.isEdit = this.config.data.isEdit;
    this.id = this.config.data.id;
    this.field = this.config.data.field;
  }

  create() {
    this.loading = true;

    const methodObs = this.isEdit
      ? this.fieldService.updateField(this.fieldForm.getValue(), this.id)
      : this.fieldService.createField(this.fieldForm.getValue());

    methodObs
      .pipe(finalize(() => (this.loading = false)))
      .subscribe((result) => {
        if (result) {
          this.ref.close(true);
        } else {
          alert(this.isEdit ? 'Поле не обновлено' : 'Поле не создано');
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
