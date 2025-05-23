import { Component, Input, OnInit } from '@angular/core';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
} from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import {
  CarFormEnums,
  ICarForm,
  RealCarForm,
  ServerCar,
} from 'src/app/entities/car';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CarService } from 'src/app/services/car/car.service';
import { CarFormEnumsStrings } from './car-form.strings';
import { SessionService } from 'src/app/services/session/session.service';
import * as CryptoJS from 'crypto-js';
import { finalize } from 'rxjs';

type CarFormEnum =
  | CarFormEnums.CarQuestionnaire
  | CarFormEnums.Checkboxes
  | CarFormEnums.ExteriorInspection
  | CarFormEnums.GeneralCondition
  | CarFormEnums.Inspection;

interface CarFormField<T = string> {
  title: string;
  key: T;
  id: string;
}

type FieldObject<T extends CarFormEnum> = {
  [key in T]: CarFormField<T>;
};

function keys<T extends Object>(obj: T): Array<keyof typeof obj> {
  return Object.keys(obj) as Array<keyof typeof obj>;
}

@Component({
  selector: 'za-create-car-form',
  templateUrl: './create-car-form.component.html',
  styleUrls: ['./create-car-form.component.scss'],
  providers: [CarService],
})
export class CreateCarFormComponent implements OnInit {
  readonly carFormStrings = CarFormEnumsStrings;

  CarFormEnums = CarFormEnums;

  loading: boolean = false;
  readOnly: boolean = false;
  isAdminRole: boolean = false;

  get formNotValid() {
    return false;
  }

  @Input() car!: ServerCar.Response;

  public carQuestionnaireForm!: UntypedFormGroup;
  public generalConditionForm!: UntypedFormGroup;
  public inspectionForm!: UntypedFormGroup;
  public exteriorInspectionForm!: UntypedFormGroup;
  public checkboxesForm!: UntypedFormGroup;
  public descriptionForm!: UntypedFormGroup;

  public carQuestionnaireFields!: CarFormField<CarFormEnums.CarQuestionnaire>[];
  public generalConditionFields!: CarFormField<CarFormEnums.GeneralCondition>[];
  public inspectionFields!: FieldObject<CarFormEnums.Inspection>;
  public exteriorInspectionFields!: FieldObject<CarFormEnums.ExteriorInspection>;
  public checkboxesFields!: FieldObject<CarFormEnums.Checkboxes>;
  public descriptionField!: CarFormField;

  private carForm!: RealCarForm;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private fb: UntypedFormBuilder,
    private sessionService: SessionService,
    private carService: CarService,
  ) {}

  ngOnInit(): void {
    this.car = this.config.data.car;
    this.readOnly = this.config.data.readOnly;
    this.isAdminRole = this.sessionService.isRealAdminOrHigher;
    let worksheet: ICarForm | null;

    try {
      const worksheetSource =
        FieldsUtils.getFieldValue(this.car, FieldNames.Car.worksheet) || '';
      worksheet = JSON.parse(worksheetSource);
    } catch (error) {
      worksheet = null;
    }

    this.carForm = worksheet
      ? new RealCarForm(worksheet, this.car)
      : new RealCarForm(null, this.car);

    this.carQuestionnaireFields = keys(this.carForm.carQuestionnaire).map(
      (field) => ({
        title: this.carFormStrings.CarQuestionnaire[field],
        key: field,
        id: `carQuestionnaire-${field}`,
      }),
    );

    this.generalConditionFields = keys(this.carForm.generalCondition).map(
      (field) => ({
        title: this.carFormStrings.GeneralCondition[field],
        key: field,
        id: `generalCondition-${field}`,
      }),
    );

    this.inspectionFields = keys(this.carForm.inspection).reduce(
      (previos, field) => {
        return {
          ...previos,
          [field]: {
            title: this.carFormStrings.Inspection[field],
            key: field,
            id: `inspection-${field}`,
          },
        };
      },
      {} as FieldObject<CarFormEnums.Inspection>,
    );

    this.exteriorInspectionFields = keys(
      this.carForm.exteriorInspection,
    ).reduce((previos, field) => {
      return {
        ...previos,
        [field]: {
          title: this.carFormStrings.ExteriorInspection[field],
          key: field,
          id: `exteriorInspection-${field}`,
        },
      };
    }, new Object() as FieldObject<CarFormEnums.ExteriorInspection>);

    this.checkboxesFields = keys(this.carForm.checkboxes).reduce(
      (previos, field) => {
        return {
          ...previos,
          [field]: {
            title: this.carFormStrings.Checkboxes[field],
            key: field,
            id: `checkboxes-${field}`,
          },
        };
      },
      new Object() as FieldObject<CarFormEnums.Checkboxes>,
    );

    this.descriptionField = {
      title: this.carFormStrings.AdditionalStrings.description,
      key: 'description',
      id: `description`,
    };

    this.carQuestionnaireForm = this.fb.group(this.carForm.carQuestionnaire);
    for (const key in this.carQuestionnaireForm.controls) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.carQuestionnaireForm.controls,
          key,
        )
      ) {
        const element = this.carQuestionnaireForm.controls[key];
        element.setValidators(Validators.required);
        element.markAsTouched();
        element.markAsDirty();
      }
    }

    this.generalConditionForm = this.fb.group(this.carForm.generalCondition);
    for (const key in this.generalConditionForm.controls) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.generalConditionForm.controls,
          key,
        )
      ) {
        const element = this.generalConditionForm.controls[key];
        element.setValidators(Validators.required);
        element.markAsTouched();
        element.markAsDirty();
      }
    }

    this.inspectionForm = this.fb.group(this.carForm.inspection);
    for (const key in this.inspectionForm.controls) {
      if (
        Object.prototype.hasOwnProperty.call(this.inspectionForm.controls, key)
      ) {
        const element = this.inspectionForm.controls[key];
        const excluseFields: string[] = [
          CarFormEnums.Inspection.guarantee,
          CarFormEnums.Inspection.termGuarantee,
          CarFormEnums.Inspection.stateInspection,
          CarFormEnums.Inspection.termStateInspection,
          CarFormEnums.Inspection.valueAddedTax,
          'bodyCondition',
        ];
        if (!excluseFields.includes(key)) {
          element.setValidators(Validators.required);
          element.markAsTouched();
          element.markAsDirty();
        }
      }
    }

    this.exteriorInspectionForm = this.fb.group(
      this.carForm.exteriorInspection,
    );
    for (const key in this.exteriorInspectionForm.controls) {
      if (
        Object.prototype.hasOwnProperty.call(
          this.exteriorInspectionForm.controls,
          key,
        )
      ) {
        const element = this.exteriorInspectionForm.controls[key];
        element.setValidators([Validators.required]);
        element.markAsTouched();
        element.markAsDirty();
      }
    }

    this.checkboxesForm = this.fb.group(this.carForm.checkboxes);

    this.descriptionForm = this.fb.group({
      description: this.carForm.description,
    });
    for (const key in this.descriptionForm.controls) {
      if (
        Object.prototype.hasOwnProperty.call(this.descriptionForm.controls, key)
      ) {
        const element = this.descriptionForm.controls[key];
        element.setValidators(Validators.required);
        element.markAsTouched();
        element.markAsDirty();
      }
    }
  }

  create() {
    if (this.readOnly) {
      this.ref.close(false);
    }

    this.loading = true;

    for (const iterator of this.carQuestionnaireFields) {
      const control = this.carQuestionnaireForm.controls[iterator.key];

      if (!control.pristine) {
        this.carForm.carQuestionnaire[iterator.key] = control.value;
      }
    }

    for (const iterator of this.generalConditionFields) {
      const control = this.generalConditionForm.controls[iterator.key];

      if (!control.pristine) {
        this.carForm.generalCondition[iterator.key] = control.value;
      }
    }

    for (const key in this.inspectionFields) {
      if (Object.prototype.hasOwnProperty.call(this.inspectionFields, key)) {
        const element = this.inspectionFields[key as CarFormEnums.Inspection];
        const control = this.inspectionForm.controls[element.key];
        if (!control.pristine) {
          this.carForm.inspection[element.key] = control.value;
        }
      }
    }

    for (const key in this.exteriorInspectionFields) {
      if (
        Object.prototype.hasOwnProperty.call(this.exteriorInspectionFields, key)
      ) {
        const element =
          this.exteriorInspectionFields[key as CarFormEnums.ExteriorInspection];
        const control = this.exteriorInspectionForm.controls[element.key];
        if (!control.pristine) {
          this.carForm.exteriorInspection[element.key] = control.value;
        }
      }
    }

    for (const key in this.checkboxesFields) {
      if (Object.prototype.hasOwnProperty.call(this.checkboxesFields, key)) {
        const element = this.checkboxesFields[key as CarFormEnums.Checkboxes];
        const control = this.checkboxesForm.controls[element.key];
        if (!control.pristine) {
          this.carForm.checkboxes[element.key] = control.value;
        }
      }
    }

    const descriptionControl = this.descriptionForm.controls['description'];
    if (!descriptionControl.pristine) {
      this.carForm.description = descriptionControl.value;
    }

    this.carService
      .editCarForm(this.car.id, this.carForm)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (res) => {
          if (res) {
            alert('Форма сохранена');
            this.ref.close(true);
          } else {
            alert('Форма не сохранена');
          }
        },
        (e) => {
          console.error(e);
          alert('Форма не сохранена');
        },
      );
  }

  createTestData() {
    this.inspectionForm.patchValue({
      ...CarFormEnumsStrings.Inspection,
      date: new Date().toLocaleDateString('ru-RU'),
      vin: CryptoJS.AES.encrypt(new Date().toString(), 'vin')
        .toString()
        .slice(0, 17),
    });
    this.generalConditionForm.patchValue({
      ...CarFormEnumsStrings.GeneralCondition,
    });
    this.carQuestionnaireForm.patchValue({
      ...CarFormEnumsStrings.CarQuestionnaire,
    });
  }

  cancel() {
    this.ref.close(false);
  }

  idTrackBy(index: number, item: { id: string }) {
    return item.id;
  }
}
