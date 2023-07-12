import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServerCar } from 'src/app/entities/car';
import { StringHash } from 'src/app/entities/constants';
import { FieldsUtils, FieldType, RealField, ServerField, UIRealField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerRole } from 'src/app/entities/role';
import { ServerUser } from 'src/app/entities/user';
import { CarService } from 'src/app/services/car/car.service';
import { SessionService } from 'src/app/services/session/session.service';
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
    UserService,
    CarService
  ]
})
export class CreateCarComponent implements OnInit {
  loading = false;

  @Input() car: ServerCar.Response | undefined = undefined;
  @Input() carOwnerFieldConfigs: ServerField.Response[] = [];
  @Input() carFieldConfigs: ServerField.Response[] = [];

  carQuestionnaireValid = false;
  carOwnerFormValid = false;

  shootingDateAvailable = false;
  shootingDate = new Date();
  private startShootingDate = +(new Date());

  carDynamicFormFields: DynamicFieldBase<string>[] = [];
  carOwnerDynamicFormFields: DynamicFieldBase<string>[] = [];
  ourLinksDynamicFormFields: DynamicFieldBase<string>[] = [];


  @ViewChild('carQuestionnaire', { read: DynamicFormComponent }) carDynamicForm!: DynamicFormComponent;
  @ViewChild('carOwnerForm', { read: DynamicFormComponent }) carOwnerDynamicForm!: DynamicFormComponent;
  @ViewChild('ourLinksForm', { read: DynamicFormComponent }) ourLinksDynamicForm!: DynamicFormComponent;

  carExcludeFields: FieldNames.Car[] = [
    // FieldNames.Car.date,
    'ownerNumber' as FieldNames.Car,
    FieldNames.Car.carQuestionnaire,
    FieldNames.Car.contactCenterSpecialistId,
    FieldNames.Car.carShootingSpecialistId,
    FieldNames.Car.bargain,
    FieldNames.Car.commission,
    FieldNames.Car.ourLinks,
    FieldNames.Car.linkToVideo,
    FieldNames.Car.shootingDate,
    FieldNames.Car.shootingTime,
    FieldNames.Car.adPrice,
    FieldNames.Car.mainPhotoId,
  ];

  carOwnerExcludeFields: FieldNames.CarOwner[] = [
    'ownerNumber' as FieldNames.CarOwner
  ];

  contactCenterUsers: ServerUser.Response[] = [];
  carShootingUsers: ServerUser.Response[] = [];

  constructor(
    private carService: CarService,
    private dfcs: DynamicFieldControlService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private sessionService: SessionService,
  ) {
    this.car = this.config?.data?.car || undefined;
  }

  ngOnInit(): void {
    this.carOwnerFieldConfigs = this.config.data.carOwnerFieldConfigs;
    this.carFieldConfigs = this.config.data.carFieldConfigs;
    this.contactCenterUsers = this.config.data.contactCenterUsers;
    this.carShootingUsers = this.config.data.carShootingUsers;

    this.generateForm();
  }

  generateForm() {
    if (!this.sessionService.isAdminOrHigher) {
      this.carExcludeFields.push(...[
        // FieldNames.Car.source,
        FieldNames.Car.status,
        FieldNames.Car.dateOfLastStatusChange
      ]);
    }

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

    const carQuestionnaireFields = this.dfcs.getDynamicFieldsFromDBFields(this.carFieldConfigs
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

    if (this.sessionService.isAdminOrHigher || this.sessionService.isContactCenterChief) {
      const contactCenterField = this.carFieldConfigs.find(cfc => cfc.name === FieldNames.Car.contactCenterSpecialistId);
      carQuestionnaireFields.push(
        this.dfcs.getDynamicFieldFromOptions({
          id: contactCenterField?.id || -1,
          value: this.car?.fields.find(f => f.name === FieldNames.Car.contactCenterSpecialistId)?.value || 'None',
          key: FieldNames.Car.contactCenterSpecialistId,
          label: settingsCarsStrings.contactCenterSpecialistId,
          order: 1,
          controlType: FieldType.Dropdown,
          variants: [
            { value: 'Никто', key: 'None' },
            ...this.contactCenterUsers.map(u => ({ key: `${u.id}`, value: `${FieldsUtils.getFieldStringValue(u, FieldNames.User.name) || u.email}` }))
          ]
        })
      )
      // const carShootingField = this.carFieldConfigs.find(cfc => cfc.name === FieldNames.Car.carShootingSpecialistId);
      // carQuestionnaireFields.push(
      //   this.dfcs.getDynamicFieldFromOptions({
      //     id: carShootingField?.id || -1,
      //     value: this.car?.fields.find(f => f.name === FieldNames.Car.carShootingSpecialistId)?.value || 'None',
      //     key: FieldNames.Car.carShootingSpecialistId,
      //     label: settingsCarsStrings.carShootingSpecialistId,
      //     order: 1,
      //     controlType: FieldType.Dropdown,
      //     variants: [
      //       { value: 'Никто', key: 'None' },
      //       ...this.carShootingUsers.map(u => ({ key: `${u.id}`, value: `${FieldsUtils.getFieldStringValue(u, FieldNames.User.name) || u.email}` }))
      //     ]
      //   })
      // )
    }

    if (this.sessionService.isAdminOrHigher || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief) {
      this.shootingDateAvailable = true;
      const date = this.car && FieldsUtils.getFieldStringValue(this.car, FieldNames.Car.shootingDate) || `${+(new Date())}`
      this.shootingDate = new Date(+date);
      this.startShootingDate = +(this.shootingDate)

      // const shootingTimeField = this.carFieldConfigs.find(cfc => cfc.name === FieldNames.Car.shootingTime);

      // carQuestionnaireFields.push(
      //   this.dfcs.getDynamicFieldFromOptions({
      //     id: shootingDateField?.id || -1,
      //     value: `${this.car && FieldsUtils.getFieldStringValue(this.car, FieldNames.Car.shootingDate) || +(new Date())}`,
      //     key: FieldNames.Car.shootingDate,
      //     label: settingsCarsStrings.shootingDate,
      //     order: 1,
      //     controlType: FieldType.Date,
      //   })
      // )
    }


    const ourLinks: [string, string, string] = this.car ? (FieldsUtils.getFieldStringValue(this.car, FieldNames.Car.ourLinks) || ',,')?.split(',') as any : ['', '', ''];
    const ourLinksField = this.carFieldConfigs.find(c => c.name === FieldNames.Car.ourLinks) as ServerField.Response;

    this.carOwnerDynamicFormFields = carOwnerFormFields;
    this.carDynamicFormFields = carQuestionnaireFields;

    const ourLinksDynamicFormFields = [
      this.dfcs.getDynamicFieldFromOptions({
        id: ourLinksField.id,
        value: ourLinks[0] || '',
        key: 'ourLinks0',
        label: 'av.by',
        order: 1,
        controlType: FieldType.Text
      }), this.dfcs.getDynamicFieldFromOptions({
        id: -2,
        value:  ourLinks[1] || '',
        key: 'ourLinks1',
        label: 'abw.by',
        order: 1,
        controlType: FieldType.Text
      }), this.dfcs.getDynamicFieldFromOptions({
        id: -1,
        value:  ourLinks[2] || '',
        key: 'ourLinks2',
        label: 'ab.onliner.by',
        order: 1,
        controlType: FieldType.Text
      })
    ]
    this.ourLinksDynamicFormFields = ourLinksDynamicFormFields;
  }

  create() {
    this.loading = true;

    const carFields = this.carDynamicForm.getValue();
    const carOwnerFields = this.carOwnerDynamicForm.getValue();

    const ownerNumber = carOwnerFields.find(f => f.name === 'ownerNumber')?.value || this.car?.ownerNumber || '';
    const contactCenterUser = carFields.find(f => f.name === FieldNames.Car.contactCenterSpecialistId);
    const carShootingUser = carFields.find(f => f.name === FieldNames.Car.carShootingSpecialistId);

    const fields = [
      ...carFields.filter(fc => !this.carExcludeFields.includes(fc.name as FieldNames.Car)),
      ...carOwnerFields.filter(fc => !this.carOwnerExcludeFields.includes(fc.name as FieldNames.CarOwner))
    ];

    const ourLinks = this.ourLinksDynamicForm.getAllValue();

    const ourLinksField: RealField.Request = {
      id: ourLinks[0].id,
      value: ourLinks.map(l => l.value).join(',')
    }

    fields.push(ourLinksField);

    if (contactCenterUser) {
      fields.push(contactCenterUser);
    }
    if (carShootingUser) {
      fields.push(carShootingUser)
    }

    if (this.shootingDateAvailable && this.startShootingDate !== +this.shootingDate) {
      const shootingDateField = this.carFieldConfigs.find(cfc => cfc.name === FieldNames.Car.shootingDate);
      shootingDateField && fields.push({
        id: shootingDateField.id,
        value: `${+this.shootingDate}`
      });
    }

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
        this.ref.close(result);
      } else {
        alert(!!this.car ? 'Машина не обновлёна' : 'Машина не создана');
      }
    })
  }

  cancel() {
    this.ref.close(false);
  }

  setValidForm(value: boolean, string: 'carQuestionnaireValid' | 'carOwnerFormValid') {
    if (string === 'carQuestionnaireValid') {
      this.carQuestionnaireValid = value;
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
      case FieldNames.Car.carShootingSpecialistId:
        field.label = settingsCarsStrings.carShootingSpecialistId;
        break;
      // case FieldNames.Car.dateOfLastStatusChange:
      //   field.label = settingsCarsStrings.dateOfLastStatusChange;
      //   break;
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
      case FieldNames.Car.bodyType:
        field.label = settingsCarsStrings.bodyType;
        break;
      case FieldNames.Car.dateOfLastStatusChange:
        field.label = settingsCarsStrings.dateOfLastStatusChange;
        break;

    }

    return field;
  }
}
