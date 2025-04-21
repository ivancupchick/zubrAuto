import { Component, Input, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, take } from 'rxjs';
import { CarService } from 'src/app/services/car/car.service';

@Component({
  selector: 'za-change-car-owner-number',
  templateUrl: './change-car-owner-number.component.html',
  styleUrls: ['./change-car-owner-number.component.scss'],
  providers: [CarService],
})
export class ChangeCarOwnerNumberComponent implements OnInit {
  loading = false;
  @Input() ownerNumber = '';
  @Input() carId!: number;

  get formNotValid() {
    return false;
  }

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private carService: CarService,
  ) {}

  ngOnInit(): void {
    this.carId = this.config.data.carId;
    this.ownerNumber = this.config.data.ownerNumber;
  }

  update() {
    this.loading = true;

    const ownerNumber = this.ownerNumber;

    this.carService
      .updateCar({ ownerNumber, fields: [] }, this.carId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe(
        (res) => {
          if (res) {
            alert('Телефон изменен');
            this.ref.close(true);
          } else {
            alert('Телефон не изменен');
          }
        },
        (e) => {
          console.error(e);
          alert('Телефон не изменен');
        },
      );
  }

  cancel() {
    this.ref.close(false);
  }
}
