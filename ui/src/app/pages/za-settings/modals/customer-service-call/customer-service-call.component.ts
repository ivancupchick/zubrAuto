import { Component, Input, OnInit } from '@angular/core';
import * as moment from 'moment';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { ServerCar, UICarStatistic } from 'src/app/entities/car';
import { CarService } from 'src/app/services/car/car.service';

@Component({
  selector: 'za-customer-service-call',
  templateUrl: './customer-service-call.component.html',
  styleUrls: ['./customer-service-call.component.scss'],
  providers: [
    CarService
  ]
})
export class CustomerServiceCallComponent implements OnInit {
  loading = false;

  statisticsTab: { title: string, data: any, options: any }[] = [];

  @Input() car!: ServerCar.Response;

  get formNotValid() {
    // const link = this.link ? this.link.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi) : null;

    return false;
  };

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private carService: CarService,
  ) { }

  ngOnInit(): void {
    this.car = this.config.data.car;

    this.carService.getAllCarStatistic(this.car.id).subscribe(result => {
      const lastThirtyDays = [...new Array(30)].map((i, idx) => moment().startOf("day").subtract(idx, "days"));

      const getCountyByType = (type: UICarStatistic.StatisticType, date: Date, statistic: UICarStatistic.Item[]): number => {
        return statistic.filter(r => {
          return r.type === type && r.date.getDate() === date.getDate() && date.getMonth() === r.date.getMonth()
        }).length
      }

      const last7Days = lastThirtyDays.filter((item, i) => i < 7).reverse();
      const last14Days = lastThirtyDays.filter((item, i) => i < 14).reverse();
      const last30Days = lastThirtyDays.filter((item, i) => i < 30).reverse();

      this.statisticsTab = [{
        title: 'За 7 дней',
        data: {
          labels: last7Days.map(item => item.format('DD/MM')),
            datasets: [
                {
                    label: 'Звонки',
                    data: last7Days.map(momentDate => getCountyByType(UICarStatistic.StatisticType.Call, momentDate.toDate(), result)),
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: .4
                }, {
                    label: 'Запланированы показы',
                    data: last7Days.map(momentDate => getCountyByType(UICarStatistic.StatisticType.PlanShowing, momentDate.toDate(), result)),
                    fill: false,
                    borderColor: '#FFA726',
                    tension: .4
                }, {
                  label: 'Сделанные показы',
                  data: last7Days.map(momentDate => getCountyByType(UICarStatistic.StatisticType.SuccessShowing, momentDate.toDate(), result)),
                  fill: false,
                  borderColor: '#ebedef',
                  tension: .4
              }
            ]
        },
        options: {
          // plugins: {
          //     legend: {
          //         labels: {
          //             color: '#495057'
          //         }
          //     }
          // },
          // scales: {
          //     x: {
          //         ticks: {
          //             color: '#495057'
          //         },
          //         grid: {
          //             color: '#ebedef'
          //         }
          //     },
          //     y: {
          //         ticks: {
          //             color: '#495057'
          //         },
          //         grid: {
          //             color: '#ebedef'
          //         }
          //     }
          // }
        },
      }, {
        title: 'За 14 дней',
        data: {
          labels: last14Days.map(item => item.format('DD/MM')),
            datasets: [
                {
                    label: 'Звонки',
                    data: last14Days.map(momentDate => getCountyByType(UICarStatistic.StatisticType.Call, momentDate.toDate(), result)),
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: .4
                }, {
                    label: 'Запланированы показы',
                    data: last14Days.map(momentDate => getCountyByType(UICarStatistic.StatisticType.PlanShowing, momentDate.toDate(), result)),
                    fill: false,
                    borderColor: '#FFA726',
                    tension: .4
                }, {
                  label: 'Сделанные показы',
                  data: last14Days.map(momentDate => getCountyByType(UICarStatistic.StatisticType.SuccessShowing, momentDate.toDate(), result)),
                  fill: false,
                  borderColor: '#ebedef',
                  tension: .4
              }
            ]
        },
        options: {

        },
      }, {
        title: 'За 30 дней',
        data: {
          labels: last30Days.map(item => item.format('DD/MM')),
            datasets: [
                {
                    label: 'Звонки',
                    data: last30Days.map(momentDate => getCountyByType(UICarStatistic.StatisticType.Call, momentDate.toDate(), result)),
                    fill: false,
                    borderColor: '#42A5F5',
                    tension: .4
                }, {
                    label: 'Запланированы показы',
                    data: last30Days.map(momentDate => getCountyByType(UICarStatistic.StatisticType.PlanShowing, momentDate.toDate(), result)),
                    fill: false,
                    borderColor: '#FFA726',
                    tension: .4
                }, {
                  label: 'Сделанные показы',
                  data: last30Days.map(momentDate => getCountyByType(UICarStatistic.StatisticType.SuccessShowing, momentDate.toDate(), result)),
                  fill: false,
                  borderColor: '#ebedef',
                  tension: .4
              }
            ]
        },
        options: {

        },
      }]
    })
  }

  save() {
    // if (this.selectedStatus === 'None') {
    //   return;
    // }

    // this.loading = true;

    // this.carService.changeCarStatus(this.carId, this.selectedStatus, this.comment).subscribe(res => {
    //   this.loading = false;

    //   if (res) {
    //     alert('Статус изменен');
    //     this.ref.close(true);
    //   } else {
    //     alert('Статус не изменен');
    //   }
    // }, e => {
    //   console.error(e);
    //   alert('Статус не изменен');
    //   this.loading = false;
    // })
    this.ref.close(false);
  }

  cancel() {
    this.ref.close(false);
  }

}
