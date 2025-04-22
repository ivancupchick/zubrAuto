import { Component, Input, OnInit } from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { ServerCar } from 'src/app/entities/car';
import { ServerClient } from 'src/app/entities/client';
import { ClientService } from 'src/app/services/client/client.service';
import { DynamicFieldControlService } from '../../shared/dynamic-form/dynamic-field-control.service';
import {
  CarChip,
  SelectCarComponent,
} from '../select-car/select-car.component';
import { FieldNames } from 'src/app/entities/FieldNames';
import { FieldsUtils } from 'src/app/entities/field';
import { finalize } from 'rxjs';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { ButtonDirective } from 'primeng/button';
import { PrimeTemplate } from 'primeng/api';
import { FormsModule } from '@angular/forms';
import { ChipsModule } from 'primeng/chips';

@Component({
  selector: 'za-complete-client-deal',
  templateUrl: './complete-client-deal.component.html',
  styleUrls: ['./complete-client-deal.component.scss'],
  standalone: true,
  imports: [
    ChipsModule,
    FormsModule,
    PrimeTemplate,
    ButtonDirective,
    SpinnerComponent,
  ],
})
export class CompleteClientDealComponent implements OnInit {
  private selectedRealCars: ServerCar.Response[] = [];

  @Input() client: ServerClient.Response | undefined = undefined;
  @Input() cars: ServerCar.Response[] = [];

  selectedCars: CarChip[] = [];
  loading = false;

  constructor(
    private clientService: ClientService,
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
  ) {
    this.client = this.config?.data?.client || undefined;
    this.cars = this.config?.data?.cars || undefined;
  }

  ngOnInit(): void {
    if (this.cars) {
      this.selectedCars = this.cars.map((item) => {
        const car = this.cars.find((c) => c.id === item.id);
        const markModel = car
          ? `${FieldsUtils.getFieldValue(car, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(car, FieldNames.Car.model)}`
          : '';

        car && this.selectedRealCars.push(car);

        return {
          id: item.id,
          markModel,
        };
      });
    }
  }

  openEditCars() {
    this.dialogService
      .open(SelectCarComponent, {
        data: {
          cars: this.selectedCars,
          origignalCars: this.selectedRealCars,
          carsToSelect: this.cars,
        },
        header: 'Выбор машины',
        width: '90%',
        height: '90%',
      })
      .onClose.subscribe((res: CarChip[] | boolean) => {
        if (res !== false && Array.isArray(res)) {
          // const deleteCars = this.originalCarChips.filter(oc => !res.find(r => r.id === oc.id));

          const cars = [...res];

          this.selectedRealCars = this.cars.filter(
            (ac) => !!res.find((r) => r.id === ac.id),
          );

          this.setCarsToForm(cars);
        }
      });
  }

  complete() {
    this.loading = true;

    if (!this.client) {
      console.error(this.client + ' undefined');
      return;
    }

    this.clientService
      .completeDeal(this.client.id, this.selectedCars[0].id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (res) => {
          if (res) {
            alert('Сделка успешно завершена');
            this.ref.close(true);
            return;
          }

          alert('Сделка не завершена');
        },
        (error) => {
          alert('Сделка не завершена');
          console.error(error);
        },
      );
  }

  cancel() {
    this.ref.close(false);
  }

  setCarsToForm(cars: CarChip[]) {
    this.selectedCars = cars;
  }
}
