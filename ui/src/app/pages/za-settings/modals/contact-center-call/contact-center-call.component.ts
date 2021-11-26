import { Component, Input, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CarService } from 'src/app/services/car/car.service';

@Component({
  selector: 'za-contact-center-call',
  templateUrl: './contact-center-call.component.html',
  styleUrls: ['./contact-center-call.component.scss'],
  providers: [
    CarService
  ]
})
export class ContactCenterCallComponent implements OnInit {
  get formNotValid() {
    // const link = this.link ? this.link.match(/[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi) : null;

    return this.selectedStatus === 'None';
  };

  comment = '';

  loading = false;

  statuses: { value: string, key: string }[] = [];
  selectedStatus: 'None' | FieldNames.CarStatus = 'None';

  @Input() carId!: number;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private carService: CarService,
  ) { }

  ngOnInit(): void {
    this.carId = this.config.data.carId;

    const availableStatuses = [
      FieldNames.CarStatus.contactCenter_MakingDecision,
      FieldNames.CarStatus.contactCenter_NoAnswer,
      FieldNames.CarStatus.contactCenter_WaitingShooting,
      FieldNames.CarStatus.contactCenter_InProgress
    ]

    this.statuses = [
      { value: 'Никто', key: 'None' },
      ...availableStatuses
        .map(carStatus => ({ value: carStatus, key: carStatus }))
    ];
  }

  create() {
    if (this.selectedStatus === 'None') {
      return;
    }

    this.loading = true;

    this.carService.contactCenterCall(this.carId, this.selectedStatus, this.comment).subscribe(res => {
      alert('Статус изменен');
      this.loading = false;
      this.ref.close(false);
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
