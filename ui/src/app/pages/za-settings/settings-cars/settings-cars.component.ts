import { Component, OnInit } from '@angular/core';
import { DialogService } from 'primeng/dynamicdialog';
import { zip } from 'rxjs';
import { ServerCar } from 'src/app/entities/car';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CarService } from 'src/app/services/car/car.service';
import { CreateCarComponent } from '../modals/create-car/create-car.component';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid.component';
import { settingsCarsStrings } from './settings-cars.strings';

@Component({
  selector: 'za-settings-cars',
  templateUrl: './settings-cars.component.html',
  styleUrls: ['./settings-cars.component.scss'],
  providers: [
    DialogService,
    CarService
  ]
})
export class SettingsCarsComponent implements OnInit {
  sortedCars: ServerCar.GetResponse[] = [];
  rawCars: ServerCar.GetResponse[] = [];

  gridConfig!: GridConfigItem<ServerCar.GetResponse>[];
  gridActionsConfig: GridActionConfigItem<ServerCar.GetResponse>[] = [{
    title: '',
    icon: 'pencil',
    buttonClass: 'secondary',
    disabled: () => this.carFieldConfigs.length === 0,
    handler: (car) => this.updateCar(car)
  }, {
    title: '',
    icon: 'times',
    buttonClass: 'danger',
    handler: (car) => this.deleteCar(car)
  }]

  carFieldConfigs: ServerField.Entity[] = [];
  carOwnerFieldConfigs: ServerField.Entity[] = [];

  readonly strings = settingsCarsStrings;

  constructor(private carService: CarService, private dialogService: DialogService) { }

  ngOnInit(): void {
    zip(this.carService.getCarFields(), this.carService.getCarOwnersFields())
      .subscribe(([carFieldConfigs, carOwnerFieldConfigs]) => {
        this.carFieldConfigs = carFieldConfigs;
        this.carOwnerFieldConfigs = carOwnerFieldConfigs;
      });

    this.carService.getCars().subscribe((result) => {
      this.rawCars = result;
      this.sortCars();
    })

    this.gridConfig = [{
      title: this.strings.id,
      name: 'id',
      getValue: (item) => item.id,
    }, {
      title: this.strings.ownerNumber,
      name: 'ownerNumber',
      getValue: (item) => item.ownerNumber,
    }, {
      title: this.strings.status,
      name: 'status',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.status),
    }, {
      title: this.strings.engine,
      name: 'engine',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.engine),
    }, {
      title: this.strings.engineCapacity,
      name: 'engineCapacity',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.engineCapacity),
    }, {
      title: this.strings.mark,
      name: 'mark',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.mark),
    }, {
      title: this.strings.model,
      name: 'model',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.model),
    }, {
      title: this.strings.transmission,
      name: 'transmission',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.transmission),
    }, {
      title: this.strings.color,
      name: 'color',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.color),
    }];
  }

  updateCar(car: ServerCar.GetResponse) {
    const ref = this.dialogService.open(CreateCarComponent, {
      data: {
        car,
        carFieldConfigs: this.carFieldConfigs,
        carOwnerFieldConfigs: this.carOwnerFieldConfigs
      },
      header: 'Редактировать машину',
      width: '70%'
    });
  }

  deleteCar(car: ServerCar.GetResponse) {
    this.carService.deleteCar(car.id)
      .subscribe(res => {
        console.log(res);
      });
  }

  private sortCars() {
    this.sortedCars = this.rawCars;
  }

  openNewCarWindow() {
    const ref = this.dialogService.open(CreateCarComponent, {
      data: {
        carFieldConfigs: this.carFieldConfigs,
        carOwnerFieldConfigs: this.carOwnerFieldConfigs
      },
      header: 'Новая машина',
      width: '70%'
    });
  }
}
