import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { ServerCar, UICarStatistic, CarStatistic } from 'src/app/entities/car';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CarService } from 'src/app/services/car/car.service';

@Component({
  selector: 'za-customer-service-call',
  templateUrl: './customer-service-call.component.html',
  styleUrls: ['./customer-service-call.component.scss'],
  providers: [CarService],
})
export class CustomerServiceCallComponent implements OnInit {
  loading = false;

  statisticsTab: { title: string; data: any; options: any }[] = [];

  @Input() car!: ServerCar.Response;

  discount: string = '';

  allStatistics: UICarStatistic.Item[] = [];

  discountTimeLine: { date: string; text: string }[] = [];

  get formNotValid() {
    // const link = this.link ? this.link.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi) : null;

    return false;
  }

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private carService: CarService,
  ) {}

  ngOnInit(): void {
    this.car = this.config.data.car;

    this.fetchStatistics();
  }

  fetchStatistics() {
    this.carService.getAllCarStatistic(this.car.id).subscribe((result) => {
      this.allStatistics = result;

      const mainStatisticsTypes = [
        UICarStatistic.StatisticType.Call,
        UICarStatistic.StatisticType.PlanShowing,
        UICarStatistic.StatisticType.SuccessShowing,
      ];
      this.setMainStatistics(
        result.filter((item) => mainStatisticsTypes.includes(item.type)),
      );

      this.setDiscountStatistics(
        result.filter(
          (item) => item.type === UICarStatistic.StatisticType.Discount,
        ),
      );
    });
  }

  setDiscountStatistics(statistics: UICarStatistic.Item[]) {
    this.discountTimeLine = [
      ...statistics.map((statistic) => {
        return {
          text: `Цена до уценки ${(statistic.content as CarStatistic.DiscountContent).amount}, Уценка ${(statistic.content as CarStatistic.DiscountContent).discount}`,
          date: `${moment(new Date(+statistic.date)).format('DD.MM.YYYY HH:mm')}`,
        };
      }),
      // {status: 'Processing', date: '15/10/2020 14:00', icon: PrimeIcons.COG, color: '#673AB7'},
      // {status: 'Shipped', date: '15/10/2020 16:15', icon: PrimeIcons.ENVELOPE, color: '#FF9800'},
      // {status: 'Delivered', date: '16/10/2020 10:00', icon: PrimeIcons.CHECK, color: '#607D8B'}
    ];
  }

  setMainStatistics(statistics: UICarStatistic.Item[]) {
    const dates = statistics.map((st) => st.date.getTime());
    const minDate =
      dates.length > 0 ? Math.min(...dates) : new Date().getTime();

    const date1 = new Date(minDate).getTime();
    const date2 = new Date().getTime();
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    const lastThirtyDays = [...new Array(30)].map((i, idx) =>
      moment().startOf('day').subtract(idx, 'days'),
    );
    const last365Days = [...new Array(diffDays)]
      .map((i, idx) => moment().startOf('day').subtract(idx, 'days'))
      .reverse();

    const getCountyByType = (
      type: UICarStatistic.StatisticType,
      date: Date,
      statistic: UICarStatistic.Item[],
    ): number => {
      return statistic.filter((r) => {
        return (
          r.type === type &&
          r.date.getDate() === date.getDate() &&
          date.getMonth() === r.date.getMonth()
        );
      }).length;
    };

    const last7Days = lastThirtyDays.filter((item, i) => i < 7).reverse();
    const last14Days = lastThirtyDays.filter((item, i) => i < 14).reverse();
    const last30Days = lastThirtyDays.filter((item, i) => i < 30).reverse();

    this.statisticsTab = [
      {
        title: 'За 7 дней',
        data: {
          labels: last7Days.map((item) => item.format('DD/MM')),
          datasets: [
            {
              label: 'Звонки',
              data: last7Days.map((momentDate) =>
                getCountyByType(
                  UICarStatistic.StatisticType.Call,
                  momentDate.toDate(),
                  statistics,
                ),
              ),
              fill: false,
              borderColor: '#42A5F5',
              tension: 0.4,
            },
            {
              label: 'Запланированы показы',
              data: last7Days.map((momentDate) =>
                getCountyByType(
                  UICarStatistic.StatisticType.PlanShowing,
                  momentDate.toDate(),
                  statistics,
                ),
              ),
              fill: false,
              borderColor: '#FFA726',
              tension: 0.4,
            },
            {
              label: 'Сделанные показы',
              data: last7Days.map((momentDate) =>
                getCountyByType(
                  UICarStatistic.StatisticType.SuccessShowing,
                  momentDate.toDate(),
                  statistics,
                ),
              ),
              fill: false,
              borderColor: '#ebedef',
              tension: 0.4,
            },
          ],
        },
        options: {},
      },
      {
        title: 'За 14 дней',
        data: {
          labels: last14Days.map((item) => item.format('DD/MM')),
          datasets: [
            {
              label: 'Звонки',
              data: last14Days.map((momentDate) =>
                getCountyByType(
                  UICarStatistic.StatisticType.Call,
                  momentDate.toDate(),
                  statistics,
                ),
              ),
              fill: false,
              borderColor: '#42A5F5',
              tension: 0.4,
            },
            {
              label: 'Запланированы показы',
              data: last14Days.map((momentDate) =>
                getCountyByType(
                  UICarStatistic.StatisticType.PlanShowing,
                  momentDate.toDate(),
                  statistics,
                ),
              ),
              fill: false,
              borderColor: '#FFA726',
              tension: 0.4,
            },
            {
              label: 'Сделанные показы',
              data: last14Days.map((momentDate) =>
                getCountyByType(
                  UICarStatistic.StatisticType.SuccessShowing,
                  momentDate.toDate(),
                  statistics,
                ),
              ),
              fill: false,
              borderColor: '#ebedef',
              tension: 0.4,
            },
          ],
        },
        options: {},
      },
      {
        title: 'За 30 дней',
        data: {
          labels: last30Days.map((item) => item.format('DD/MM')),
          datasets: [
            {
              label: 'Звонки',
              data: last30Days.map((momentDate) =>
                getCountyByType(
                  UICarStatistic.StatisticType.Call,
                  momentDate.toDate(),
                  statistics,
                ),
              ),
              fill: false,
              borderColor: '#42A5F5',
              tension: 0.4,
            },
            {
              label: 'Запланированы показы',
              data: last30Days.map((momentDate) =>
                getCountyByType(
                  UICarStatistic.StatisticType.PlanShowing,
                  momentDate.toDate(),
                  statistics,
                ),
              ),
              fill: false,
              borderColor: '#FFA726',
              tension: 0.4,
            },
            {
              label: 'Сделанные показы',
              data: last30Days.map((momentDate) =>
                getCountyByType(
                  UICarStatistic.StatisticType.SuccessShowing,
                  momentDate.toDate(),
                  statistics,
                ),
              ),
              fill: false,
              borderColor: '#ebedef',
              tension: 0.4,
            },
          ],
        },
        options: {},
      },
      diffDays > 30
        ? {
            title: `За ${diffDays} дн(я/ей)`,
            data: {
              labels: last365Days.map((item) => item.format('DD/MM')),
              datasets: [
                {
                  label: 'Звонки',
                  data: last365Days.map((momentDate) =>
                    getCountyByType(
                      UICarStatistic.StatisticType.Call,
                      momentDate.toDate(),
                      statistics,
                    ),
                  ),
                  fill: false,
                  borderColor: '#42A5F5',
                  tension: 0.4,
                },
                {
                  label: 'Запланированы показы',
                  data: last365Days.map((momentDate) =>
                    getCountyByType(
                      UICarStatistic.StatisticType.PlanShowing,
                      momentDate.toDate(),
                      statistics,
                    ),
                  ),
                  fill: false,
                  borderColor: '#FFA726',
                  tension: 0.4,
                },
                {
                  label: 'Сделанные показы',
                  data: last365Days.map((momentDate) =>
                    getCountyByType(
                      UICarStatistic.StatisticType.SuccessShowing,
                      momentDate.toDate(),
                      statistics,
                    ),
                  ),
                  fill: false,
                  borderColor: '#ebedef',
                  tension: 0.4,
                },
              ],
            },
            options: {},
          }
        : null,
    ].filter((r) => !!r) as { title: string; data: any; options: any }[];
  }

  save() {
    this.loading = true;

    this.carService
      .addCustomerCall(this.car.id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (res) => {
          if (res) {
            alert('Звонок записан');
            this.ref.close(true);
          } else {
            alert('Звонок не записан');
          }
        },
        (e) => {
          console.error(e);
          alert('Звонок не записан');
        },
      );
    this.ref.close(false);
  }

  makeDiscount() {
    this.loading = true;

    const discount = Number(this.discount);

    if (!discount) {
      alert('Величина уценка должна быть числом');
      return;
    }

    const amount = FieldsUtils.getFieldNumberValue(
      this.car,
      FieldNames.Car.carOwnerPrice,
    );

    if (!amount) {
      alert('У автомобиля нет цены');
      return;
    }

    this.carService
      .addCustomerDiscount(this.car.id, discount, amount)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (res) => {
          if (res) {
            alert('Уценка совершена');
            this.fetchStatistics();
          } else {
            alert('Уценка не совершена');
          }
        },
        (e) => {
          console.error(e);
        },
      );
    // this.ref.close(false);
  }

  cancel() {
    this.ref.close(false);
  }
}
