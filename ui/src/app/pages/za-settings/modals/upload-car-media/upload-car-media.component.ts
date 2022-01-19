import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
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

  uplo: File[] = [];

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

  @ViewChild(FileUpload) fileUpload!: FileUpload;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private carService: CarService,
  ) { }

  ngOnInit(): void {
    this.car = this.config.data.car;

    this.getImages();
  }

  getImages() {
    this.loading = true;
    this.carService.getCarsImages(this.car.id)
      .subscribe(images => {
        this.images = images.map(image => {
          // image.url = environment.serverUrl+'/'+image.url;
          return image;
        });

        this.loading = false;
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
    this.ref.close(true);
  }

  cancel() {
    this.ref.close(false);
  }

  getImageUrl(image: CarImage.Response) {
    return `${image.url}`;
  }

  uploadNewImage({ files }: { files: File[]}) {
    this.uplo = files;

    this.loading = true;

    this.carService.uploadCarImages(this.car.id, this.uplo, '').subscribe(res => {
      this.getImages();

      this.fileUpload.clear();

      this.loading = false;
    })
  }
}
