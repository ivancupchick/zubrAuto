import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServerCar } from 'src/app/entities/car';
import { StringHash } from 'src/app/entities/constants';
import { FieldType, ServerField, UIRealField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerRole } from 'src/app/entities/role';
import { ServerUser } from 'src/app/entities/user';
import { CarService } from 'src/app/services/car/car.service';
import { UserService } from 'src/app/services/user/user.service';
import { settingsCarsStrings } from '../../settings-cars/settings-cars.strings';
import { DynamicFieldControlService } from '../../shared/dynamic-form/dynamic-field-control.service';
import { DynamicFieldBase } from '../../shared/dynamic-form/dynamic-fields/dynamic-field-base';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';

@Component({
  selector: 'za-create-car',
  templateUrl: './create-car.component.html',
  styleUrls: ['./create-car.component.scss'],
  providers: [
    DynamicFieldControlService,
    UserService
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
    'ownerNumber' as FieldNames.Car,
    FieldNames.Car.contactCenterSpecialistId,
  ];

  carOwnerExcludeFields: FieldNames.CarOwner[] = [
    'ownerNumber' as FieldNames.CarOwner
  ];

  contactCenterUsers: ServerUser.Response[] = [];

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
    this.contactCenterUsers = this.config.data.contactCenterUsers;

    this.generateForm();
  }

  generateForm() {
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

    carOwnerFormFields.push(
      this.dfcs.getDynamicFieldFromOptions({
        id: -1,
        value: this.car?.ownerNumber || '',
        key: 'ownerNumber',
        label: settingsCarsStrings.ownerNumber,
        order: 1,
        controlType: FieldType.Text
      })
    );

    const contactCenterField = this.carFieldConfigs.find(cfc => cfc.name === FieldNames.Car.contactCenterSpecialistId);
    carFormFields.push(
      this.dfcs.getDynamicFieldFromOptions({
        id: contactCenterField?.id || -1,
        value: this.car?.fields.find(f => f.name === FieldNames.Car.contactCenterSpecialistId)?.value || 'None',
        key: FieldNames.Car.contactCenterSpecialistId,
        label: settingsCarsStrings.contactCenterSpecialistId,
        order: 1,
        controlType: FieldType.Dropdown,
        variants: [
          { value: 'Никто', key: 'None' },
          ...this.contactCenterUsers.map(u => ({ key: `${u.id}`, value: u.email }))
        ]
      })
    )

    this.carOwnerDynamicFormFields = carOwnerFormFields;
    this.carDynamicFormFields = carFormFields;
    console.log(carFormFields);
  }

  create() {
    this.loading = true;

    const carFields = this.carDynamicForm.getValue();
    const carOwnerFields = this.carOwnerDynamicForm.getValue();

    const ownerNumber = carOwnerFields.find(f => f.name === 'ownerNumber')?.value || this.car?.ownerNumber || '';
    const contactCenterUser = carFields.find(f => f.name === FieldNames.Car.contactCenterSpecialistId);

    const fields = [
      ...carFields.filter(fc => !this.carExcludeFields.includes(fc.name as FieldNames.Car)),
      ...carOwnerFields.filter(fc => !this.carOwnerExcludeFields.includes(fc.name as FieldNames.CarOwner))
    ];

    if (contactCenterUser) {
      fields.push(contactCenterUser);
    }

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
      case FieldNames.CarOwner.name:
        field.label = settingsCarsStrings.ownerName;
        break;

      case FieldNames.Car.carOwnerPrice:
        field.label = settingsCarsStrings.carOwnerPrice;
        break;
      case FieldNames.Car.contactCenterSpecialistId:
        field.label = settingsCarsStrings.contactCenterSpecialistId;
        break;
      case FieldNames.Car.dateOfLastStatusChange:
        field.label = settingsCarsStrings.dateOfLastStatusChange;
        break;
      case FieldNames.Car.driveType:
        field.label = settingsCarsStrings.driveType;
        break;
      case FieldNames.Car.engineCapacity:
        field.label = settingsCarsStrings.engineCapacity;
        break;
      case FieldNames.Car.linkToAd:
        field.label = settingsCarsStrings.linkToAd;
        break;
      case FieldNames.Car.ourLinks:
        field.label = settingsCarsStrings.ourLinks;
        break;
      case FieldNames.Car.shootingDate:
        field.label = settingsCarsStrings.shootingDate;
        break;
      case FieldNames.Car.shootingTime:
        field.label = settingsCarsStrings.shootingTime;
        break;
      case FieldNames.Car.adPrice:
        field.label = settingsCarsStrings.adPrice;
        break;
    }

    return field;
  }
}
