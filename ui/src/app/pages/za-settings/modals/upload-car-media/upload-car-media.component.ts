import { Component, Input, OnInit } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CarImage, ServerCar } from 'src/app/entities/car';
import { CarService } from 'src/app/services/car/car.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'za-upload-car-media',
  templateUrl: './upload-car-media.component.html',
  styleUrls: ['./upload-car-media.component.scss'],
  providers: [
    CarService
  ]
})
export class UploadCarMediaComponent implements OnInit {
  loading = false;
  link: string = '';
  images: CarImage.Response[] = [];

  get formNotValid() {
    return false
  }

  uplo!: File;

  responsiveOptions = [{
    breakpoint: '1024px',
    numVisible: 3,
    numScroll: 3
  }, {
    breakpoint: '768px',
    numVisible: 2,
    numScroll: 2
  }, {
    breakpoint: '560px',
    numVisible: 1,
    numScroll: 1
  }];

  @Input() car!: ServerCar.Response;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private carService: CarService,
  ) { }

  ngOnInit(): void {
    this.car = this.config.data.car;

    this.uploadCarImages();
    // this.availableStatuses = this.config.data.availableStatuses;
    // this.commentIsRequired = this.config.data.commentIsRequired || false;

    // if (this.availableStatuses.length > 1) {
    //   this.selectedStatus = 'None';

    //   this.statuses = [
    //     { value: 'Никто', key: 'None' },
    //     ...this.availableStatuses
    //       .map(carStatus => ({ value: carStatus, key: carStatus }))
    //   ];
    // } else {
    //   this.selectedStatus = this.availableStatuses[0];
    //   this.statuses = this.availableStatuses
    //     .map(carStatus => ({ value: carStatus, key: carStatus }));
    // }
  }

  uploadCarImages() {
    this.carService.getCarsImages(this.car.id).subscribe(images => {
      this.images = images.map(image => {
        image.url = environment.serverUrl+'/'+image.url;
        return image;
      });
    })
  }

  create() {
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
  }

  cancel() {
    this.ref.close(false);
  }

  getImageUrl(image: CarImage.Response) {
    console.log(image.url);
    return `${image.url}`;
  }

  uploadNewImage({ files }: { files: File[]}) {
    for (let file of files) {
      this.uplo = file;
    }

    this.carService.uploadCarImages(this.car.id, this.uplo, '').subscribe(res => {
      console.log(res);
      this.uploadCarImages();
    })
  }
}
