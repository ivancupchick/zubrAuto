import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormsModule, ReactiveFormsModule, UntypedFormControl, ValidationErrors } from '@angular/forms';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { getCarStatus, ServerCar } from 'src/app/entities/car';
import { ServerClient } from 'src/app/entities/client';
import { ServerField, UIRealField, FieldsUtils, FieldType } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CarService } from 'src/app/services/car/car.service';
import { ClientService } from 'src/app/services/client/client.service';
import { settingsClientsStrings } from '../../settings-clients/settings-clients.strings';
import { DynamicFieldControlService } from '../../shared/dynamic-form/dynamic-field-control.service';
import { DynamicFieldBase } from '../../shared/dynamic-form/dynamic-fields/dynamic-field-base';
import { DynamicFormComponent } from '../../shared/dynamic-form/dynamic-form.component';
import { CarChip, SelectCarComponent } from '../select-car/select-car.component';
import { StringHash } from 'src/app/entities/constants';
import { CarStatusLists, QueryCarTypes } from '../../settings-cars/cars.enums';
import { SessionService } from 'src/app/services/session/session.service';
import { ServerUser } from 'src/app/entities/user';
import { finalize, map, mergeMap, of } from 'rxjs';
import { ClientPreviewComponent } from '../../client/modals/client-preview/client-preview.component';
import { CommonModule } from '@angular/common';
import { DynamicFormModule } from '../../shared/dynamic-form/dynamic-form.module';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipsModule } from 'primeng/chips';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { ButtonModule } from 'primeng/button';
import { InputTextareaModule } from 'primeng/inputtextarea';
import * as moment from 'moment';

@Component({
  selector: 'za-create-client',
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DynamicFormModule,
    CheckboxModule,
    ChipsModule,
    FormsModule,
    ReactiveFormsModule,
    SpinnerComponent,
    ButtonModule,
    InputTextareaModule
  ],
  providers: [
    DynamicFieldControlService,
    CarService,
    ClientService,
  ]
})
export class CreateClientComponent implements OnInit {
  loading = false;

  @Input() predefinedCar: ServerCar.Response | undefined = undefined;
  @Input() client: ServerClient.Response | undefined = undefined;
  @Input() predefinedFields: Partial<{ [key in FieldNames.Client]: string }> = {};
  @Input() fieldConfigs: ServerField.Response[] = [];
  @Input() specialists: ServerUser.Response[] = [];

  @Input()
  get hasSelectionOfCars(): boolean {
    return this.config?.data?.hasSelectionOfCars ?? true;
  };

  selectedCars: CarChip[] = [];
  private originalCarChips: CarChip[] = [];
  private selectedRealCars: ServerCar.Response[] = [];
  // private allCars: ServerCar.Response[] = [];

  formValid = false;

  isJustCall!: UntypedFormControl;

  dynamicFormFields: DynamicFieldBase<string>[] = [];

  description = '';

  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;

  excludeFields: FieldNames.Client[] = [
    FieldNames.Client.date,
    'carIds' as FieldNames.Client,
    FieldNames.Client.specialistId,
    FieldNames.Client.description,
  ];

  constructor(
    private clientService: ClientService,
    private dfcs: DynamicFieldControlService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
    private carService: CarService,
    private sessionService: SessionService,
  ) {
    this.client = this.config?.data?.client || undefined;
    this.predefinedFields = this.config?.data?.predefinedFields || {};
    this.predefinedCar = this.config?.data?.predefinedCar || undefined;
  }

  ngOnInit(): void {
    this.fieldConfigs = this.config.data.fieldConfigs;
    this.specialists = this.config.data.specialists;

    this.isJustCall = new UntypedFormControl(false);

    this.isJustCall.valueChanges.subscribe((res: boolean) => {
      if (res) {
        this.dynamicForm.formGroup.disable();
        this.formValid = true;
      } else {
        this.dynamicForm.formGroup.enable();
      }
    });

    const formFields = this.dfcs.getDynamicFieldsFromDBFields(this.fieldConfigs
      .filter(fc => !this.excludeFields.includes(fc.name as FieldNames.Client))
      .map(fc => {
        let fieldValue = !!this.client
          ? this.client.fields.find(f => f.id === fc.id)?.value || ''
          : this.predefinedFields[fc.name as FieldNames.Client] || '';

        if ([FieldNames.Client.dateNextAction, FieldNames.Client.saleDate].includes(fc.name as FieldNames.Client)) {
          fc.type = FieldType.Date;

          if (fieldValue && Number.isNaN(+fieldValue)) { // TODO fix  Number.isNaN
            fieldValue = `${+moment(fieldValue)}`;
          }
        }

        const newField = new UIRealField(
          fc,
          fieldValue
        );

        return newField;
      }))
        .map(fc => this.updateFieldConfig(fc));

    if (this.sessionService.isAdminOrHigher || this.sessionService.isCarSalesChief || this.sessionService.isCustomerServiceChief) {
      const specialistIdField = this.fieldConfigs.find(cfc => cfc.name === FieldNames.Client.specialistId);
      formFields.push(
        this.dfcs.getDynamicFieldFromOptions({
          id: specialistIdField?.id || -1,
          value: this.client?.fields.find(f => f.name === FieldNames.Client.specialistId)?.value || 'None',
          key: FieldNames.Client.specialistId,
          label: 'Специалист',
          order: 1,
          controlType: FieldType.Dropdown,
          variants: [
            { value: 'Никто', key: 'None' },
            ...this.specialists.map(u => ({ key: `${u.id}`, value: `${FieldsUtils.getFieldStringValue(u, FieldNames.User.name) || u.email}` }))
          ]
        })
      );
    }

    this.dynamicFormFields = formFields;

    this.loading = true;

    const query: StringHash = {};
    query[FieldNames.Car.status] = CarStatusLists[QueryCarTypes.carsForSale].join(',');

    const obs = this.client && this.client.carIds && this.client.carIds.split(',').length
      ? this.carService.getCarsByQuery(Object.assign(query, { id: this.client.carIds.split(',').map(a => !Number.isNaN(+a) ? +a : a)})).pipe(map(res => res.list))
      : of([])

    obs.pipe(
      finalize(() => this.loading = false)
    ).subscribe(cars => {
      if (this.client) {
        let carIds: (number | string)[] = [];

        this.description = FieldsUtils.getFieldStringValue(this.client.fields, FieldNames.Client.description);

        try {
          carIds = this.client.carIds
            ? this.client.carIds.split(',').map(a => !Number.isNaN(+a) ? +a : a) || []
            : [];
        } catch (error) {
          carIds = [];
        }

        this.originalCarChips = carIds.map(id => {
          const car = cars.find(c => c.id === id);
          const markModel = car
            ? `${FieldsUtils.getFieldValue(car, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(car, FieldNames.Car.model)}`
            : `${id}`;

          car && this.selectedRealCars.push(car);

          return {
            id,
            markModel,
          }
        });

        this.setCarsToForm(this.originalCarChips)
      } else if (this.predefinedCar) {
        this.selectedRealCars.push(this.predefinedCar)

        this.originalCarChips = [{
          id: this.predefinedCar.id,
          markModel: `${FieldsUtils.getFieldValue(this.predefinedCar, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(this.predefinedCar, FieldNames.Car.model)}`,
        }];

        this.setCarsToForm(this.originalCarChips)
      }
    })
  }

  create() {
    this.loading = true;

    if (this.isJustCall.value) {
      const carIds = this.selectedCars.map(sc => sc.id);

      if (!carIds.length) {
        this.loading = false;
        alert('Вы не выбрали не одной машины...');
        return;
      }

      this.carService.addCall(carIds).pipe(
        finalize(() => this.loading = false)
      ).subscribe(result => {
        if (result) {
          alert('Звонки учтены');
          this.cancel(true);
        } else {
          alert('Звонки не учтены, нажмите F12, заскриньте красные ошибки в консоли и отправьте администратору.');
        }
      })
    } else {
      const fields = this.dynamicForm.getAllValue();

      const carIds = this.selectedCars.map(sc => sc.id).join(',');
      const client: ServerClient.CreateRequest = {
        carIds,
        fields: fields.filter(fc => fc.name === FieldNames.Client.specialistId || !this.excludeFields.includes(fc.name as FieldNames.Client))
      }

      if (!this.client) {
        const dateField = this.fieldConfigs.find(fc => fc.name === FieldNames.Client.date);
        if (dateField) {
          client.fields.push({
            id: dateField.id,
            name: dateField.name,
            value: `${+(new Date())}`
          })
        } else {
          console.log("Заскриньте пожалуйста ошибку, запомните шаги что привело к этому, и сообщите начальнику");
        }
      }

      const descriptionField = this.fieldConfigs.find(fc => fc.name === FieldNames.Client.description);
      if (descriptionField) {
        client.fields.push({
          id: descriptionField.id,
          name: descriptionField.name,
          value: this.description
        })
      } else {
        // TODO create right expression for this error
        console.log("Заскриньте пожалуйста ошибку, запомните шаги что привело к этому, и сообщите начальнику");
      }

      if (!this.client && !(
        this.sessionService.isAdminOrHigher || this.sessionService.isCarSalesChief || this.sessionService.isCustomerServiceChief
      )) {
        const specialistIdField = this.fieldConfigs.find(cfc => cfc.name === FieldNames.Client.specialistId);
        if (specialistIdField) {
          client.fields.push({
            id: specialistIdField.id,
            name: specialistIdField.name,
            value: `${this.sessionService.userId}`
          })
        } else {
          // TODO create right expression for this error
          console.error('specialistIdField is undefined');
          console.log("Заскриньте пожалуйста ошибку, запомните шаги что привело к этому, и сообщите начальнику");
        }
      }


      if (!FieldsUtils.getFieldStringValue(client.fields, FieldNames.Client.number)) {
        console.error("Нету номера");

        this.loading = false;
        return;
      }


      const methodObs = this.client != undefined
        ? this.clientService.updateClient(client, (this.client as ServerClient.Response).id)
        : this.clientService.getClientsByNumber({ [FieldNames.Client.number]: FieldsUtils.getFieldStringValue(client.fields, FieldNames.Client.number) }).pipe(
          mergeMap((res) => {
            if (res && res.list.length) {
              res.list.forEach((existClient, index) => {
                this.dialogService.open(ClientPreviewComponent, {
                  data: {
                    client: existClient,
                    users: this.specialists,
                  },
                  header: `Уже созданный клиент #${index + 1}`,
                  width: '60%',
                  height: '50%',
                });
              })

              return of(false);
            }

            return this.clientService.createClient(client);
          })
        )

      methodObs.pipe(
        finalize(() => this.loading = false)
      ).subscribe((result: boolean) => {
        if (result) {
          this.cancel(true);
        } else {
          alert(!!this.client ? 'Клиент не обновлён' : 'Клиент не создан');
        }
      })
    }
  }

  cancel(value: boolean = false) {
    this.ref.close(value);
  }

  setValidForm(value: boolean) {
    this.formValid = value;
  }

  setDirtyFormFields(value: boolean) {
    if (value) {
      Object.keys(this.dynamicForm.formGroup.controls).forEach(key => {
        this.dynamicForm.formGroup.get(key)!.markAsDirty();
      });
    }
  }

  updateFieldConfig(field: DynamicFieldBase<string>) {
    if (settingsClientsStrings[field.key]) {
      field.label = settingsClientsStrings[field.key];
    }

    if (field.key === FieldNames.Client.number) {
      field.validators.push((control: AbstractControl): ValidationErrors | null => {
        const controlValue = control.value;

        if (controlValue.length === 13 && controlValue[0] === '+' && controlValue[1] === '3' && controlValue[2] === '7' && controlValue[3] === '5') {
          return null;
        }

        if (controlValue.length === 12 && controlValue[0] === '+' && controlValue[1] === '7') {
          return null;
        }

        return {
          numberIsInvalid: { value: control.value }
        };
      });
    }

    return field;
  }

  onAddCar(event: { originalEvent: KeyboardEvent, value: string }) {
    event.originalEvent.preventDefault();
    event.originalEvent.stopPropagation();

    this.selectedCars = [{
      id: event.value,
      markModel: event.value,
    }];
  }

  openEditCars() {
    this.dialogService.open(SelectCarComponent, {
      data: {
        cars: this.selectedCars,
        origignalCars: this.selectedRealCars,
      },
      header: 'Выбор машины',
      width: '90%',
      height: '90%',
    }).onClose.subscribe((res: { chips: CarChip[], realCars: ServerCar.Response[] } | false) => {
      if (res && Array.isArray(res.chips)) {
        this.selectedRealCars = res.realCars;
        this.setCarsToForm([...res.chips]);
      }
    });
  }

  setCarsToForm(cars: CarChip[]) {
    this.selectedCars = cars;
  }
}
