import { Component, Input, OnInit } from '@angular/core';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerClient } from 'src/app/entities/client';
import { StringHash } from 'src/app/entities/constants';
import { CarService } from 'src/app/services/car/car.service';
import { map, of } from 'rxjs';
import { FieldType, FieldsUtils } from 'src/app/entities/field';
import { settingsClientsStrings } from '../../../settings-clients/settings-clients.strings';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import * as moment from 'moment';
import { ServerUser } from 'src/app/entities/user';

@Component({
  selector: 'za-client-preview',
  templateUrl: './client-preview.component.html',
  styleUrls: ['./client-preview.component.scss'],
})
export class ClientPreviewComponent implements OnInit {
  @Input() client!: ServerClient.Response;
  @Input() users!: ServerUser.Response[];
  clientJSON: string = '';

  constructor(
    private carService: CarService,
    private config: DynamicDialogConfig,
  ) {
    this.client = this.config?.data?.client || undefined;
    this.users = this.config?.data?.users || undefined;
  }

  ngOnInit(): void {
    const clientObj: StringHash = {};
    clientObj.id = `${this.client.id}`;

    this.client.fields.forEach((field) => {
      let value = FieldsUtils.getFieldValue([field], field.name);

      if (
        field.type === FieldType.Date ||
        [
          FieldNames.Client.date,
          FieldNames.Client.dateNextAction,
          FieldNames.Client.saleDate,
        ].includes(field.name as FieldNames.Client)
      ) {
        value = moment(+FieldsUtils.getFieldValue([field], field.name)).format(
          'DD.MM.yyyy',
        );
      }

      if (field.type === FieldType.Dropdown) {
        value = FieldsUtils.getDropdownValue([field], field.name);
      }

      if (field.name === FieldNames.Client.specialistId) {
        const user = this.users.find((u) => +u.id === +value)!;
        value = `${FieldsUtils.getFieldStringValue(user, FieldNames.User.name)}`;
      }

      clientObj[settingsClientsStrings[field.name]] = value;
    });

    const query: StringHash = {};
    const obs =
      this.client && this.client.carIds && this.client.carIds.split(',').length
        ? this.carService
            .getCarsByQuery(
              Object.assign(query, {
                id: this.client.carIds
                  .split(',')
                  .map((a) => (!Number.isNaN(+a) ? +a : a)),
              }),
            )
            .pipe(map((res) => res.list))
        : of([]);

    obs.subscribe((cars) => {
      if (cars.length) {
        clientObj.cars = cars
          .map((c) => {
            return `
          ${c.id}
          ${FieldsUtils.getFieldValue(c, FieldNames.Car.mark)}
          ${FieldsUtils.getFieldValue(c, FieldNames.Car.model)}`;
          })
          .join(', ');
      }
    });

    this.clientJSON = JSON.stringify(clientObj, null, 2);
  }
}
