import { Component, Input, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServerCar } from 'src/app/entities/car';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';

export interface CarChip {
  id: number;
  markModel: string;
}

@Component({
  selector: 'za-select-car',
  templateUrl: './select-car.component.html',
  styleUrls: ['./select-car.component.scss']
})
export class SelectCarComponent implements OnInit {
  loading = false;

  @Input() cars: CarChip[] = [];
  @Input() origignalCars: ServerCar.Response[] = [];

  selectedCars: ServerCar.Response[] = [];

  formValid = true;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig
  ) {}

  ngOnInit(): void {
    this.cars = [...this.config.data.cars];
    this.selectedCars = [...this.config.data.origignalCars];
    this.origignalCars = [...this.config.data.origignalCars];
  }

  save() {
    const result: (CarChip | null)[] = this.selectedCars.map(car => {
      // const car = this.cars.find(r => r.id === gd.id);

      // if (!car) {
      //   return null;
      // }

      return {
        id: car.id,
        markModel: this.getCarName(car),
      }
    })

    this.ref.close(result.filter(r => !!r));
  }

  cancel() {
    this.ref.close(false);
  }

  getCarName(car: ServerCar.Response) {
    return `${FieldsUtils.getFieldValue(car, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(car, FieldNames.Car.model)}`;
  }

  onSelectCar(cars: ServerCar.Response[]) {
    this.selectedCars = [...cars];
  }
}