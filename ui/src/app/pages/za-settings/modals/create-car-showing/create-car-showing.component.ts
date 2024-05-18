import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize } from 'rxjs';
import { CarStatistic, ServerCar, UICarShowingStatistic } from 'src/app/entities/car';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CarService } from 'src/app/services/car/car.service';

@Component({
  selector: 'za-create-car-showing',
  templateUrl: './create-car-showing.component.html',
  styleUrls: ['./create-car-showing.component.scss'],
  providers: [
    CarService
  ]
})
export class CreateCarShowingComponent implements OnInit {
  loading = false;

  // formGroup!: FormGroup;
  @Input() statiscticItem: UICarShowingStatistic | null = null;
  @Input() cars: ServerCar.Response[] = [];
  @Input() clientId!: number;


  statuses: { value: string, key: string }[] = [];
  carsOptions: { value: string, key: number }[] = [];
  selectedCarId!: number;

  selectedStatus: CarStatistic.ShowingStatus | '' = '';

  showingComment: string = '';

  showingDate: Date = new Date();

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private carService: CarService
  ) { }

  ngOnInit(): void {
    this.statiscticItem = this.config.data.statiscticItem;
    this.cars = this.config.data.cars;
    this.clientId = this.config.data.clientId;

    this.carsOptions = [
      { value: 'Машина не выбрана', key: -1 },
        ...this.cars.map((car => ({
        key: car.id,
        value: `${FieldsUtils.getFieldValue(car, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(car, FieldNames.Car.model)}`
      })))
    ];

    this.statuses = [
      { value: 'Статус не выбран', key: '' },
      { value: CarStatistic.ShowingStatus.plan, key: CarStatistic.ShowingStatus.plan },
      { value: CarStatistic.ShowingStatus.success, key: CarStatistic.ShowingStatus.success },
      { value: CarStatistic.ShowingStatus.cancel, key: CarStatistic.ShowingStatus.cancel },
    ]

    if (this.statiscticItem) {
      this.selectedCarId = this.statiscticItem.carId;
      this.selectedStatus = this.statiscticItem.content.status;
      this.showingComment = this.statiscticItem.content.comment
    } else {
      this.selectedCarId = -1;
      this.selectedStatus = '';
    }
  }

  create() {
    this.loading = true;

    const methodObs = this.statiscticItem
      ? this.carService.updateCarShowing(this.selectedCarId, this.statiscticItem.id, {
          clientId: this.clientId,
          comment: this.showingComment,
          date: +this.showingDate,
          status: this.selectedStatus as CarStatistic.ShowingStatus
        } )
      : this.carService.createCarShowing(this.selectedCarId, {
          clientId: this.clientId,
          comment: this.showingComment,
          date: +this.showingDate,
          status: this.selectedStatus as CarStatistic.ShowingStatus
        });

    methodObs.pipe(
      finalize(() => this.loading = false)
    ).subscribe(result => {
      if (result) {
        this.ref.close(true);
      } else {
        alert(this.statiscticItem ? 'Показ не обновлен' :'Показ не создан');
      }
    })
  }

  cancel() {
    this.ref.close(false);
  }

}
