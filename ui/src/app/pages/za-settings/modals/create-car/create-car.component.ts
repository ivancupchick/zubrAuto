import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServerCar } from 'src/app/entities/car';
import { FieldsUtils, FieldType, ServerField, UIRealField } from 'src/app/entities/field';
import { FieldNames, StringHash } from 'src/app/entities/FieldNames';
import { CarService } from 'src/app/services/car/car.service';
import { settingsCarsStrings } from '../../settings-cars/settings-cars.strings';
import { DynamicFieldControlService } from '../../shared/dynamic-form/dynamic-field-control.service';
import { DynamicFieldBase } from '../../shared/dynamic-form/dynamic-fields/dynamic-field-base';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'za-create-car',
  templateUrl: './create-car.component.html',
  styleUrls: ['./create-car.component.scss'],
  providers: [
    DynamicFieldControlService
  ]
})
export class CreateCarComponent implements OnInit {
  loading = false;

  @Input() car: ServerCar.Response | undefined = undefined;
  @Input() carOwnerFieldConfigs: ServerField.Response[] = [];
  @Input() carFieldConfigs: ServerField.Response[] = [];

  carFormValid = false;
  carOwnerFormValid = false;

  carDynamicFormFields: DynamicFieldBase<string>[] = [];
  carOwnerDynamicFormFields: DynamicFieldBase<string>[] = [];


  @ViewChild('carForm', { read: DynamicFormComponent }) carDynamicForm!: DynamicFormComponent;
  @ViewChild('carOwnerForm', { read: DynamicFormComponent }) carOwnerDynamicForm!: DynamicFormComponent;

  carExcludeFields: FieldNames.Car[] = [
    // FieldNames.Car.date,
    'ownerNumber' as FieldNames.Car
  ];

  carOwnerExcludeFields: FieldNames.CarOwner[] = [
    'ownerNumber' as FieldNames.CarOwner
  ];

  constructor(
    private carService: CarService,
    private dfcs: DynamicFieldControlService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {
    this.car = this.config?.data?.car || undefined;
  }

  ngOnInit(): void {
    this.carOwnerFieldConfigs = this.config.data.carOwnerFieldConfigs;
    this.carFieldConfigs = this.config.data.carFieldConfigs;

    const carOwnerFormFields = this.dfcs.getDynamicFieldsFromDBFields(this.carOwnerFieldConfigs
      .filter(fc => !this.carOwnerExcludeFields.includes(fc.name as FieldNames.CarOwner))
      .map(fc => {
        const fieldValue = !!this.car
          ? this.car.fields.find(f => f.id === fc.id)?.value || ''
          : '';

        const newField = new UIRealField(
          fc,
          fieldValue
        );

        return newField;
      }))
        .map(fc => this.updateFieldConfig(fc));

    const carFormFields = this.dfcs.getDynamicFieldsFromDBFields(this.carFieldConfigs
      .filter(fc => !this.carExcludeFields.includes(fc.name as FieldNames.Car))
      .map(fc => {
        const fieldValue = !!this.car
          ? this.car.fields.find(f => f.id === fc.id)?.value || ''
          : '';

        const newField = new UIRealField(
          fc,
          fieldValue
        );

        return newField;
      }))
        .map(fc => this.updateFieldConfig(fc));

    carOwnerFormFields.push(this.dfcs.getDynamicFieldFromOptions({
      id: -1,
      value: this.car?.ownerNumber || '',
      key: 'ownerNumber',
      label: settingsCarsStrings.ownerNumber,
      order: 1,
      controlType: FieldType.Text
    }))

    this.carOwnerDynamicFormFields = carOwnerFormFields;
    this.carDynamicFormFields = carFormFields;
  }

  create() {
    this.loading = true;

    const carFields = this.carDynamicForm.getValue();
    const carOwnerFields = this.carOwnerDynamicForm.getValue();

    const ownerNumber = carOwnerFields.find(f => f.name === 'ownerNumber')?.value || '';

    const fields = [
      ...carFields.filter(fc => !this.carExcludeFields.includes(fc.name as FieldNames.Car)),
      ...carOwnerFields.filter(fc => !this.carOwnerExcludeFields.includes(fc.name as FieldNames.CarOwner))
    ];

    // const car: ServerCar.CreateRequest = this.car != undefined
    //   ? {
    //     createdDate: this.car.createdDate,
    //     fields
    //   }
    //   : {
    //     createdDate: (new Date()).getTime().toString(),
    //     fields
    //   }

    const methodObs = this.car != undefined
      ? this.carService.updateCar({
          fields,
          ownerNumber
        }, this.car.id)
      : this.carService.createCar({
          fields,
          ownerNumber
        });

    methodObs.subscribe(result => {
      if (result) {
        this.ref.close(true);
      } else {
        alert(!!this.car ? 'Машина не обновлёна' : 'Машина не создана');
      }
    })
  }

  cancel() {
    this.ref.close(false);
  }

  setValidForm(value: boolean, string: 'carFormValid' | 'carOwnerFormValid') {
    if (string === 'carFormValid') {
      this.carFormValid = value;
    } else {
      this.carOwnerFormValid = value;
    }
  }

  updateFieldConfig(field: DynamicFieldBase<string>) {
    if ((settingsCarsStrings as StringHash)[field.key]) {
      field.label = (settingsCarsStrings as StringHash)[field.key];
    }

    switch (field.key) {
      // case FieldNames.Car.paymentType:
      //   field.label = settingsCarsStrings.paymentType;
      //   break;
      // case FieldNames.Car.tradeInAuto:
      //   field.label = settingsCarsStrings.tradeInAuto;
      //   break;
    }

    return field;
  }
}
