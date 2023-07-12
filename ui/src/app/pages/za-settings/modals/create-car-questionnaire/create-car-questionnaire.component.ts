import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CarQuestionnaireEnums, ICarQuestionnaire, RealCarQuestionnaire, ServerCar } from 'src/app/entities/car';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CarService } from 'src/app/services/car/car.service';
import { CarQuestionnaireEnumsStrings } from './car-questionnaire.strings';
import { SessionService } from 'src/app/services/session/session.service';
import * as CryptoJS from 'crypto-js';

type CarQuestionnaireEnum = CarQuestionnaireEnums.CarQuestionnaire | CarQuestionnaireEnums.Checkboxes | CarQuestionnaireEnums.ExteriorInspection | CarQuestionnaireEnums.GeneralCondition | CarQuestionnaireEnums.Inspection;

interface carQuestionnaireField<T = string> {
  title: string;
  key: T;
  id: string;
}

type FieldObject<T extends CarQuestionnaireEnum> = {
  [key in T]: carQuestionnaireField<T>
}

function keys<T extends Object>(obj: T): Array<keyof typeof obj> {
  return Object.keys(obj) as Array<keyof typeof obj>
}

@Component({
  selector: 'za-create-car-questionnaire',
  templateUrl: './create-car-questionnaire.component.html',
  styleUrls: ['./create-car-questionnaire.component.scss'],
  providers: [
    CarService
  ]
})
export class CreateCarQuestionnaireComponent implements OnInit {
  readonly carQuestionnaireStrings = CarQuestionnaireEnumsStrings;

  loading: boolean = false;
  readOnly: boolean = false;
  isAdminRole: boolean = false;

  get formNotValid() {
    return false;
  };

  @Input() car!: ServerCar.Response;

  public carQuestionnaireForm!: UntypedFormGroup;
  public generalConditionForm!: UntypedFormGroup;
  public inspectionForm!: UntypedFormGroup;
  public exteriorInspectionForm!: UntypedFormGroup;
  public checkboxesForm!: UntypedFormGroup;
  public descriptionForm!: UntypedFormGroup;

  public carQuestionnaireFields!: carQuestionnaireField<CarQuestionnaireEnums.CarQuestionnaire>[];
  public generalConditionFields!: carQuestionnaireField<CarQuestionnaireEnums.GeneralCondition>[];
  public inspectionFields!: FieldObject<CarQuestionnaireEnums.Inspection>;
  public exteriorInspectionFields!: FieldObject<CarQuestionnaireEnums.ExteriorInspection>;
  public checkboxesFields!: FieldObject<CarQuestionnaireEnums.Checkboxes>;
  public descriptionField!: carQuestionnaireField;

  private carQuestionnaire!: RealCarQuestionnaire;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private fb: UntypedFormBuilder,
    private sessionService: SessionService,
    private carService: CarService,
  ) { }

  ngOnInit(): void {
    this.car = this.config.data.car;
    this.readOnly = this.config.data.readOnly;
    this.isAdminRole = this.sessionService.isRealAdminOrHigher;
    let carQuestionnaire: ICarQuestionnaire | null;

    try {
      const carQuestionnaireSource = FieldsUtils.getFieldValue(this.car, FieldNames.Car.carQuestionnaire) || '';
      carQuestionnaire = JSON.parse(carQuestionnaireSource)
    } catch (error) {
      carQuestionnaire = null;
    }

    this.carQuestionnaire = carQuestionnaire
      ? new RealCarQuestionnaire(carQuestionnaire, this.car)
      : new RealCarQuestionnaire(null, this.car);

    this.carQuestionnaireFields = keys(this.carQuestionnaire.carQuestionnaire)
      .map(field => ({ title: this.carQuestionnaireStrings.CarQuestionnaire[field], key: field, id: `carQuestionnaire-${field}` }));

    this.generalConditionFields = keys(this.carQuestionnaire.generalCondition)
      .map(field => ({ title: this.carQuestionnaireStrings.GeneralCondition[field], key: field, id: `generalCondition-${field}` }));

    this.inspectionFields =  keys(this.carQuestionnaire.inspection).reduce((previos, field) => {
      return {...previos,
        [field]: { title: this.carQuestionnaireStrings.Inspection[field], key: field, id: `inspection-${field}`
      }};
    }, {} as FieldObject<CarQuestionnaireEnums.Inspection>);

    this.exteriorInspectionFields =  keys(this.carQuestionnaire.exteriorInspection).reduce((previos, field) => {
      return {...previos,
        [field]: { title: this.carQuestionnaireStrings.ExteriorInspection[field], key: field, id: `exteriorInspection-${field}`
      }};
    }, new Object() as FieldObject<CarQuestionnaireEnums.ExteriorInspection>)

    this.checkboxesFields =  keys(this.carQuestionnaire.checkboxes).reduce((previos, field) => {
      return {...previos,
        [field]: { title: this.carQuestionnaireStrings.Checkboxes[field], key: field, id: `checkboxes-${field}`
      }};
    }, new Object() as FieldObject<CarQuestionnaireEnums.Checkboxes>)

    this.descriptionField = { title: this.carQuestionnaireStrings.AdditionalStrings.description, key: 'description', id: `description` }

    this.carQuestionnaireForm = this.fb.group( this.carQuestionnaire.carQuestionnaire );
    for (const key in this.carQuestionnaireForm.controls) {
      if (Object.prototype.hasOwnProperty.call(this.carQuestionnaireForm.controls, key)) {
        const element = this.carQuestionnaireForm.controls[key];
        element.setValidators(Validators.required);
        element.markAsTouched();
        element.markAsDirty();
      }
    }

    this.generalConditionForm = this.fb.group( this.carQuestionnaire.generalCondition );
    for (const key in this.generalConditionForm.controls) {
      if (Object.prototype.hasOwnProperty.call(this.generalConditionForm.controls, key)) {
        const element = this.generalConditionForm.controls[key];
        element.setValidators(Validators.required);
        element.markAsTouched();
        element.markAsDirty();
      }
    }

    this.inspectionForm = this.fb.group( this.carQuestionnaire.inspection );
    for (const key in this.inspectionForm.controls) {
      if (Object.prototype.hasOwnProperty.call(this.inspectionForm.controls, key)) {
        const element = this.inspectionForm.controls[key];
        const excluseFields: string[] = [
          CarQuestionnaireEnums.Inspection.guarantee,
          CarQuestionnaireEnums.Inspection.termGuarantee,
          CarQuestionnaireEnums.Inspection.stateInspection,
          CarQuestionnaireEnums.Inspection.termStateInspection,
          CarQuestionnaireEnums.Inspection.valueAddedTax,
          'bodyCondition',
        ]
        if (!excluseFields.includes(key)) {
          element.setValidators(Validators.required);
          element.markAsTouched();
          element.markAsDirty();
        }
      }
    }

    this.exteriorInspectionForm = this.fb.group( this.carQuestionnaire.exteriorInspection );
    for (const key in this.exteriorInspectionForm.controls) {
      if (Object.prototype.hasOwnProperty.call(this.exteriorInspectionForm.controls, key)) {
        const element = this.exteriorInspectionForm.controls[key];
        element.setValidators([Validators.required]);
        element.markAsTouched();
        element.markAsDirty();
      }
    }

    this.checkboxesForm = this.fb.group( this.carQuestionnaire.checkboxes );

    this.descriptionForm = this.fb.group({ description: this.carQuestionnaire.description });
    for (const key in this.descriptionForm.controls) {
      if (Object.prototype.hasOwnProperty.call(this.descriptionForm.controls, key)) {
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
        this.carQuestionnaire.carQuestionnaire[iterator.key] = control.value;
      }
    }

    for (const iterator of this.generalConditionFields) {
      const control = this.generalConditionForm.controls[iterator.key];

      if (!control.pristine) {
        this.carQuestionnaire.generalCondition[iterator.key] = control.value;
      }
    }

    for (const key in this.inspectionFields) {
      if (Object.prototype.hasOwnProperty.call(this.inspectionFields, key)) {
        const element = this.inspectionFields[key as CarQuestionnaireEnums.Inspection];
        const control = this.inspectionForm.controls[element.key];
        if (!control.pristine) {
          this.carQuestionnaire.inspection[element.key] = control.value;
        }
      }
    }

    for (const key in this.exteriorInspectionFields) {
      if (Object.prototype.hasOwnProperty.call(this.exteriorInspectionFields, key)) {
        const element = this.exteriorInspectionFields[key as CarQuestionnaireEnums.ExteriorInspection];
        const control = this.exteriorInspectionForm.controls[element.key];
        if (!control.pristine) {
          this.carQuestionnaire.exteriorInspection[element.key] = control.value;
        }
      }
    }

    for (const key in this.checkboxesFields) {
      if (Object.prototype.hasOwnProperty.call(this.checkboxesFields, key)) {
        const element = this.checkboxesFields[key as CarQuestionnaireEnums.Checkboxes];
        const control = this.checkboxesForm.controls[element.key];
        if (!control.pristine) {
          this.carQuestionnaire.checkboxes[element.key] = control.value;
        }
      }
    }

    const descriptionControl = this.descriptionForm.controls['description'];
    if (!descriptionControl.pristine) {
      this.carQuestionnaire.description = descriptionControl.value;
    }

    this.carService.editCarQuestionnaire(this.car.id, this.carQuestionnaire).subscribe(res => {
      this.loading = false;

      if (res) {
        alert('Форма сохранена');
        this.ref.close(true);
      } else {
        alert('Форма не сохранена');
      }
    }, e => {
      console.error(e);
      alert('Форма не сохранена');
      this.loading = false;
    })
  }

  createTestData() {
    this.inspectionForm.patchValue({
      ...CarQuestionnaireEnumsStrings.Inspection,
      date: (new Date()).toLocaleDateString('ru-RU'),
      vin: CryptoJS.AES.encrypt( new Date().toString(), 'vin').toString().slice(0,17),
    });
    this.generalConditionForm.patchValue({
      ...CarQuestionnaireEnumsStrings.GeneralCondition
    });
    this.carQuestionnaireForm.patchValue({
      ...CarQuestionnaireEnumsStrings.CarQuestionnaire
    });
  }

  cancel() {
    this.ref.close(false);
  }

  idTrackBy(index: number, item: { id: string }) {
    return item.id;
  }
}
