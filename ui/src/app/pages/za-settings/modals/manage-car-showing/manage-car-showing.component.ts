import { Component, Input, OnInit } from '@angular/core';
import { DialogService, DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { zip } from 'rxjs';
import { CarStatistic, ServerCar, UICarShowingStatistic } from 'src/app/entities/car';
import { BDModels } from 'src/app/entities/constants';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { DateUtils } from 'src/app/entities/utils';
import { CarService } from 'src/app/services/car/car.service';
import { GridActionConfigItem, GridConfigItem } from '../../shared/grid/grid.component';
import { CreateCarShowingComponent } from '../create-car-showing/create-car-showing.component';

@Component({
  selector: 'za-manage-car-showing',
  templateUrl: './manage-car-showing.component.html',
  styleUrls: ['./manage-car-showing.component.scss'],
  providers: [
    CarService
  ]
})
export class ManageCarShowingComponent implements OnInit {
  loading = false;

  gridConfig!: GridConfigItem<UICarShowingStatistic>[];
  gridActionsConfig: GridActionConfigItem<UICarShowingStatistic>[] = [];


  @Input() carIds!: number[];
  @Input() clientId!: number;

  cars: ServerCar.Response[] = [];
  carStatistics: UICarShowingStatistic[] = [];

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private dialogService: DialogService,

    private carService: CarService,
  ) { }

  ngOnInit(): void {
    this.carIds = this.config.data.carIds;
    this.clientId = this.config.data.clientId;
    this.loading = true;

    this.setGridSettings();

    this.carService.getCars().subscribe(cars => {
      const clientCars = cars.filter(car => this.carIds.includes(car.id));
      this.cars = clientCars;

      // `${FieldsUtils.getFieldValue(car, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(car, FieldNames.Car.model)}`

      zip(...this.carIds.map(id => this.carService.getShowingCarStatistic(id)))
        .subscribe(statistics => {
          const result: UICarShowingStatistic[] = [];

          statistics.forEach(carStatistics => {
            const car = clientCars.find(car => car.id === (carStatistics[0] || {}).carId);

            if (!car) {
              return;
            }

            const statistics: (CarStatistic.CarShowingResponse & { content: CarStatistic.ShowingContent })[] = carStatistics.filter(statistic => statistic.type === CarStatistic.Type.showing) as any;

            statistics.forEach(statistic => {

              if (!car) {
                console.error('path: ui/src/app/pages/za-settings/modals/manage-car-showing/manage-car-showing.component.ts : 61');
                alert('?????????????????? ????????????, ?????????????????? ?? ?????????? ?????????? ?? ?? ???????????? ?????????????? ?????? ??????????????????. ???????????????? ????????????????????????????, ???????????????? ???????????????????? ?????????????????? ???? ????????????. ???????? ???????????????? ?????????? ??????????????????????, ?????????????????????????? ????????????????.')
              }

              result.push({
                ...statistic,
                car
              })
            })

            this.carStatistics = [...result];
          });

          // this.carStatistics = .;

          this.setGridSettings();
          this.loading = false;
        })
    })
  }

  cancel() {
    this.ref.close(false);
  }

  setGridSettings() {
    this.gridConfig = this.getGridConfig();
    this.gridActionsConfig = this.getGridActionsConfig();
  }

  getGridConfig(): GridConfigItem<UICarShowingStatistic>[] {
    return [{
      title: '????????????',
      name: 'carName',
      getValue: (item) => `${
          FieldsUtils.getFieldValue(item.car, FieldNames.Car.mark)
        } ${
          FieldsUtils.getFieldValue(item.car, FieldNames.Car.model)
        }`,
    }, {
      title: '???????? ????????????',
      name: 'date',
      getValue: (item) => DateUtils.getFormatedDate(item.content.date),
    }, {
      title: '????????????',
      name: 'status',
      getValue: (item) => item.content.status,
    }, {
      title: '??????????????????????',
      name: 'comment',
      getValue: (item) => item.content.comment,
    }];
  }

  getGridActionsConfig(): GridActionConfigItem<UICarShowingStatistic>[] {
    const configs: GridActionConfigItem<UICarShowingStatistic>[] = [{
      title: '??????????????????????????',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: () => false,
      available: () => true,
      handler: (item) => this.updateStatisticItem(item)
    }];

    return configs.filter(config => !config.available || config.available());
  }

  openNewCarShowingWindow() {
    const ref = this.dialogService.open(CreateCarShowingComponent, {
      data: {
        cars: this.cars,
        clientId: this.clientId
      },
      header: '?????????? ??????????',
      width: '70%',
      // height: '90%',
    });
  }

  updateStatisticItem(item: UICarShowingStatistic) {
    const ref = this.dialogService.open(CreateCarShowingComponent, {
      data: {
        statiscticItem: item,
        cars: this.cars,
        clientId: this.clientId
      },
      header: '?????????????????????????? ??????????',
      width: '70%'
    });
  }
}
