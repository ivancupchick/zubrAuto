import { Component, Input, OnInit } from '@angular/core';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Subject, finalize, map, mergeMap, takeUntil, zip } from 'rxjs';
import {
  CarStatistic,
  ServerCar,
  UICarShowingStatistic,
} from 'src/app/entities/car';
import { StringHash } from 'src/app/entities/constants';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { DateUtils } from 'src/app/shared/utils/date.util';
import { CarService } from 'src/app/services/car/car.service';
import { GridActionConfigItem, GridConfigItem } from '../../shared/grid/grid';
import { CreateCarShowingComponent } from '../create-car-showing/create-car-showing.component';
import { SpinnerComponent } from '../../../../shared/components/spinner/spinner.component';
import { GridComponent } from '../../shared/grid/grid.component';
import { ButtonDirective } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'za-manage-car-showing',
  templateUrl: './manage-car-showing.component.html',
  styleUrls: ['./manage-car-showing.component.scss'],
  standalone: true,
  imports: [ToolbarModule, ButtonDirective, GridComponent, SpinnerComponent],
})
export class ManageCarShowingComponent implements OnInit {
  loading = false;
  destoyed = new Subject<void>();
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
  ) {}

  ngOnInit(): void {
    this.carIds = this.config.data.carIds;
    this.clientId = this.config.data.clientId;

    this.setGridSettings();
    this.getShows();
  }

  getShows() {
    this.loading = true;
    const query: StringHash = {};
    query['id'] = this.carIds.join(',');
    // query[FieldNames.Car.status] = CarStatusLists[QueryCarTypes.carsForSale].join(',');

    this.carService
      .getCarsByQuery(query)
      .pipe(
        finalize(() => (this.loading = false)),
        map((cars) => {
          const clientCars = cars.list.filter((car) =>
            this.carIds.includes(car.id),
          );
          this.cars = clientCars;
          return null;
        }),
        mergeMap(() => {
          return zip(
            ...this.carIds.map((id) =>
              this.carService.getShowingCarStatistic(id),
            ),
          );
        }),
      )
      .subscribe((statistics) => {
        const result: UICarShowingStatistic[] = [];

        statistics.forEach((carStatistics) => {
          const car = this.cars.find(
            (car) => car.id === (carStatistics[0] || {}).carId,
          );

          if (!car) {
            return;
          }

          const statistics: (CarStatistic.CarShowingResponse & {
            content: CarStatistic.ShowingContent;
          })[] = carStatistics.filter(
            (statistic) => statistic.type === CarStatistic.Type.showing,
          ) as any;

          statistics.forEach((statistic) => {
            if (!car) {
              console.error(
                'path: ui/src/app/pages/za-settings/modals/manage-car-showing/manage-car-showing.component.ts : 61',
              );
              alert(
                'Произошла ошибка, запомните в каком месте и с какими данными она произошла. Сообщите администратору, следуйте инструкции сообщения об ошибке. Сайт работает здесь некорректно, перезагрузите страницу.',
              );
            }

            result.push({
              ...statistic,
              car,
            });
          });

          this.carStatistics = [...result];
        });

        this.setGridSettings();
      });
  }

  cancel() {
    this.ref.close(false);
  }

  setGridSettings() {
    this.gridConfig = this.getGridConfig();
    this.gridActionsConfig = this.getGridActionsConfig();
  }

  getGridConfig(): GridConfigItem<UICarShowingStatistic>[] {
    return [
      {
        title: 'Машина',
        name: 'carName',
        getValue: (item) =>
          `${FieldsUtils.getFieldValue(
            item.car,
            FieldNames.Car.mark,
          )} ${FieldsUtils.getFieldValue(item.car, FieldNames.Car.model)}`,
      },
      {
        title: 'Дата показа',
        name: 'date',
        getValue: (item) => DateUtils.getFormatedDate(item.content.date),
      },
      {
        title: 'Статус',
        name: 'status',
        getValue: (item) => item.content.status,
      },
      {
        title: 'Комментарий',
        name: 'comment',
        getValue: (item) => item.content.comment,
      },
    ];
  }

  getGridActionsConfig(): GridActionConfigItem<UICarShowingStatistic>[] {
    const configs: GridActionConfigItem<UICarShowingStatistic>[] = [
      {
        title: 'Редактировать',
        icon: 'pencil',
        buttonClass: 'secondary',
        disabled: () => false,
        available: () => true,
        handler: (item) => this.updateStatisticItem(item),
      },
    ];

    return configs.filter((config) => !config.available || config.available());
  }

  openNewCarShowingWindow() {
    const ref = this.dialogService.open(CreateCarShowingComponent, {
      data: {
        cars: this.cars,
        clientId: this.clientId,
      },
      header: 'Новый показ',
      width: '70%',
      // height: '90%',
    });
  }

  updateStatisticItem(item: UICarShowingStatistic) {
    const ref = this.dialogService.open(CreateCarShowingComponent, {
      data: {
        statiscticItem: item,
        cars: this.cars,
        clientId: this.clientId,
      },
      header: 'Редактировать показ',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  subscribeOnCloseModalRef(ref: DynamicDialogRef) {
    ref.onClose.pipe(takeUntil(this.destoyed)).subscribe((res) => {
      if (res) {
        this.loading = true;
        this.getShows();
      }
    });
  }

  ngOnDestroy(): void {
    this.destoyed.next();
  }
}
