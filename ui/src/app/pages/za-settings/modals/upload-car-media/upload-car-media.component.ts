import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FileUpload } from 'primeng/fileupload';
import { tap } from 'rxjs/operators';
import { CarImage, ServerCar } from 'src/app/entities/car';
import { FieldsUtils } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
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
  stateImages: CarImage.Response[] = [];

  mainPhotoId: number | undefined= undefined;

  get formNotValid() {
    return false
  }

  image360Uploaded = false;
  image360: CarImage.Response | undefined = undefined;

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

  @ViewChild('imagesFileUpload', { read: FileUpload }) fileUpload!: FileUpload;
  @ViewChild('image360FileUpload', { read: FileUpload }) image360FileUpload!: FileUpload;
  @ViewChild('imagesStateFileUpload', { read: FileUpload }) imagesStateFileUpload!: FileUpload;

  constructor(
    private ref: DynamicDialogRef,
    private config: DynamicDialogConfig,

    private carService: CarService,
  ) { }

  ngOnInit(): void {
    this.setCar(this.config.data.car)
  }

  setCar(car: ServerCar.Response) {
    this.car = car;

    this.link = FieldsUtils.getFieldStringValue(this.car, FieldNames.Car.linkToVideo);

    this.mainPhotoId = FieldsUtils.getFieldNumberValue(this.car, FieldNames.Car.mainPhotoId);

    this.getImages().subscribe();
  }

  getImages() {
    this.loading = true;
    return this.carService.getCarsImages(this.car.id)
      .pipe(
        tap(images => {
          this.images = images.filter(image => image.type === CarImage.Types.Image);
          this.image360Uploaded = !!images.find(image => image.type === CarImage.Types.Image360);
          this.image360 = images.find(image => image.type === CarImage.Types.Image360);
          this.stateImages = images.filter(image => image.type === CarImage.Types.StateImage)

          this.loading = false;
        })
      )
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
      this.getImages().subscribe();

      this.fileUpload.clear();
    })
  }

  uploadImage360({ files }: { files: File[]}) {
    this.uplo = files;

    this.loading = true;

    this.carService.uploadCarImage360(this.car.id, this.uplo[0], '').subscribe(res => {
      this.image360FileUpload.clear();

      this.getImages().subscribe();
    }, e => {
      console.log(e);
      this.loading = false;
    })
  }

  uploadStateImages({ files }: { files: File[]}) {
    this.uplo = files;

    this.loading = true;

    this.carService.uploadCarStateImages(this.car.id, this.uplo, '').subscribe(res => {
      this.getImages().subscribe();

      this.fileUpload.clear();
    })
  }

  selectMainPhoto(image: CarImage.Response) {
    this.loading = true;
    this.carService.selectMainPhoto(this.car.id, image.id).subscribe(res => {
      this.getImages().subscribe();
      this.carService.getCar(this.car.id).subscribe(car => {
        this.setCar(car);

        this.loading = false;
      }, e => {
        this.loading = false;
        console.error(e);
      })
    }, e => {
      this.loading = false;
      console.error(e);
    })
  }

  deletePhoto(image: CarImage.Response) {
    this.loading = true;
    this.carService.deleteCarImage(this.car.id, image.id).subscribe(res => {
      this.getImages().subscribe();
      this.carService.getCar(this.car.id).subscribe(car => {
        this.setCar(car);

        this.loading = false;
      }, e => {
        this.loading = false;
        console.error(e);
      })
    }, e => {
      this.loading = false;
      console.error(e);
    })
  }

  saveLink() {
    this.loading = true;
    this.carService.saveVideo(this.car.id, this.link).subscribe(res => {
      this.carService.getCar(this.car.id).subscribe(car => {
        this.setCar(car);

        this.loading = false;
      }, e => {
        this.loading = false;
        console.error(e);
      })
    }, e => {
      this.loading = false;
      console.error(e);
    })
  }
}
