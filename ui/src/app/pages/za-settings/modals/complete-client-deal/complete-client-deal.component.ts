import { Component, Input, OnInit } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServerCar } from 'src/app/entities/car';
import { ServerClient } from 'src/app/entities/client';
import { ClientService } from 'src/app/services/client/client.service';
import { DynamicFieldControlService } from '../../shared/dynamic-form/dynamic-field-control.service';
import { CarChip, SelectCarComponent } from '../select-car/select-car.component';

@Component({
  selector: 'za-complete-client-deal',
  templateUrl: './complete-client-deal.component.html',
  styleUrls: ['./complete-client-deal.component.scss'],
  providers: [
    DynamicFieldControlService,
    ClientService
  ]
})
export class CompleteClientDealComponent implements OnInit {
  @Input() client: ServerClient.Response | undefined = undefined;
  @Input() cars: ServerCar.Response[] = [];

  selectedCars: CarChip[] = [];

  private selectedRealCars: ServerCar.Response[] = [];

  loading = false;

  constructor(
    private clientService: ClientService,
    private dfcs: DynamicFieldControlService,

    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,
    private dialogService: DialogService,
  ) {
    this.client = this.config?.data?.client || undefined;
    this.cars = this.config?.data?.cars || undefined;
  }

  ngOnInit(): void {
  }

  openEditCars() {
    console.log(this.selectedCars);
    console.log(this.selectedRealCars);


    const ref = this.dialogService.open(SelectCarComponent, {
      data: {
        cars: this.selectedCars,
        origignalCars: this.selectedRealCars,
        carsToSelect: this.cars,
      },
      header: 'Выбор машины',
      width: '90%',
      height: '90%',
    }).onClose.subscribe((res: CarChip[] | boolean) => {
      if (res !== false && Array.isArray(res)) {
        // const deleteCars = this.originalCarChips.filter(oc => !res.find(r => r.id === oc.id));

        const cars = [...res];

        this.selectedRealCars = this.cars.filter(ac => !!res.find(r => r.id === ac.id))

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

    this.clientService.completeDeal(this.client.id, this.selectedCars[0].id)
      .subscribe(res => {
        if (res) {
          this.loading = false;
          alert('Сделка успешно завершена');
          this.ref.close(true);
          return;
        }

        alert('Сделка не завершена');
        this.loading = false;
      }, error => {
        alert('Сделка не завершена');
        console.error(error);
        this.loading = false;
      });
  }

  cancel() {
    this.ref.close(false);
  }

  setCarsToForm(cars: CarChip[]) {
    this.selectedCars = cars;
  }
}
