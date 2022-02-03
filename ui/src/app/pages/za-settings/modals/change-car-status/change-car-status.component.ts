import { Component, Input, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CarService } from 'src/app/services/car/car.service';

@Component({
  selector: 'za-change-car-status',
  templateUrl: './change-car-status.component.html',
  styleUrls: ['./change-car-status.component.scss'],
  providers: [
    CarService
  ]
})
export class ChangeCarStatusComponent implements OnInit {
  loading = false;
  statuses: { value: string, key: string }[] = [];
  selectedStatus: 'None' | FieldNames.CarStatus = 'None';
  @Input() comment = '';
  @Input() dateOfNextAction: string | undefined;
  @Input() isNextActionDateAvailable: boolean = false;
  @Input() dateOfFirstStatusChange: string = '';
  @Input() dateOfFirstStatusChangeAvailable: boolean = false;

  get formNotValid() {
    // const link = this.link ? this.link.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi) : null;

    return this.selectedStatus === 'None' || (this.commentIsRequired && this.comment === '');
  };

  @Input() carId!: number;
  @Input() availableStatuses: FieldNames.CarStatus[] = [];
  @Input() commentIsRequired = false;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private carService: CarService,
  ) { }

  ngOnInit(): void {
    this.carId = this.config.data.carId;
    this.availableStatuses = this.config.data.availableStatuses;
    this.comment = this.config.data.comment || '';
    this.dateOfNextAction = this.config.data.dateOfNextAction || '';
    this.isNextActionDateAvailable = this.config.data.isNextActionDateAvailable || false;
    this.dateOfFirstStatusChange = this.config.data.dateOfFirstStatusChange || '';
    this.dateOfFirstStatusChangeAvailable = this.config.data.dateOfFirstStatusChangeAvailable || '';

    this.commentIsRequired = this.config.data.commentIsRequired || false;

    if (this.availableStatuses.length > 1) {
      this.selectedStatus = 'None';

      this.statuses = [
        { value: 'Никто', key: 'None' },
        ...this.availableStatuses
          .map(carStatus => ({ value: carStatus, key: carStatus }))
      ];
    } else {
      this.selectedStatus = this.availableStatuses[0];
      this.statuses = this.availableStatuses
        .map(carStatus => ({ value: carStatus, key: carStatus }));
    }
  }

  create() {
    if (this.selectedStatus === 'None') {
      return;
    }

    this.loading = true;

    this.carService.changeCarStatus(
      this.carId,
      this.selectedStatus,
      this.comment,
      this.isNextActionDateAvailable ? this.dateOfNextAction : undefined,
      this.dateOfFirstStatusChangeAvailable ? this.dateOfFirstStatusChange : '3'
    ).subscribe(res => {
      this.loading = false;

      if (res) {
        alert('Статус изменен');
        this.ref.close(true);
      } else {
        alert('Статус не изменен');
      }
    }, e => {
      console.error(e);
      alert('Статус не изменен');
      this.loading = false;
    })
  }

  cancel() {
    this.ref.close(false);
  }
}
