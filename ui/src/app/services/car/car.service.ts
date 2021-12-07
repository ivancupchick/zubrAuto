import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { FieldService } from '../field/field.service';
import { CarImage, CarStatistic, RealCarForm, ServerCar } from 'src/app/entities/car';
import { map } from 'rxjs/operators';
import { FieldDomains, FieldsUtils, ServerField } from 'src/app/entities/field';
import { RequestService } from '../request/request.service';
import { Constants, StringHash } from 'src/app/entities/constants';
import { FieldNames } from 'src/app/entities/FieldNames';

const API = Constants.API.CARS;

export interface CarImageMetadata {

}

@Injectable()
export class CarService {

  constructor(private requestService: RequestService, private fieldService: FieldService) { }

  getCars(): Observable<ServerCar.Response[]> {
    return this.requestService.get<ServerCar.Response[]>(`${environment.serverUrl}/${API}/${ Constants.API.CRUD }`)
  }

  createCar(value: ServerCar.CreateRequest): Observable<boolean> {
    return this.requestService.post<never>(`${environment.serverUrl}/${API}/${ Constants.API.CRUD }`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getCar(id: number): Observable<ServerCar.Response> {
    return this.requestService.get<ServerCar.Response>(`${environment.serverUrl}/${API}/${ Constants.API.CRUD }/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  updateCar(value: ServerCar.UpdateRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.requestService.put<any>(`${environment.serverUrl}/${API}/${ Constants.API.CRUD }/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteCar(id: number): Observable<boolean> {
    return this.requestService.delete<any>(`${environment.serverUrl}/${API}/${ Constants.API.CRUD }/${id}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  createCarsByLink(link: string, userId: number) {
    return this.requestService.post<any>(`${environment.serverUrl}/${API}/${ Constants.API.CREATE_CARS_BY_LINK }`, { link, userId })
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getCarsImages(id: number) {
    return this.requestService.get<CarImage.Response[]>(`${environment.serverUrl}/${API}/${ Constants.API.IMAGES }/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  uploadCarImages(id: number, files: File, carImageMetadata: CarImageMetadata) {
    const metadata = JSON.stringify(carImageMetadata);

    const formData: FormData = new FormData();

    formData.append('metadata', metadata);

    for (let file of [files]) {
      formData.append('file', (file as any), (file as any).name);
    }

    return this.requestService.put<any, FormData>(`${environment.serverUrl}/${API}/${ Constants.API.IMAGES }/${id}`, formData).pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  changeCarStatus(id: number, newStatus: FieldNames.CarStatus, comment = '') {
    const statusConfig = this.fieldService.allFields.find(field => field.name === FieldNames.Car.status);
    const commentConfig = this.fieldService.allFields.find(field => field.name === FieldNames.Car.comment);

    if (statusConfig && commentConfig) {
      const statusField = FieldsUtils.setDropdownValue(statusConfig, newStatus);
      const commentField = FieldsUtils.setFieldValue(commentConfig, comment);

      const car: ServerCar.UpdateRequest = {
        fields: [statusField, commentField]
      }
      return this.updateCar(car, id)
    } else {
      return of(false)
    }
  }

  transformToCarShooting(id: number, shootingDate: number, carShootingSpecialistId: number, comment = '') {
    const newStatus = FieldNames.CarStatus.carShooting_InProgres;

    const shootingDateConfig = this.fieldService.allFields.find(field => field.name === FieldNames.Car.shootingDate);
    const carShootingSpecialistIdConfig = this.fieldService.allFields.find(field => field.name === FieldNames.Car.carShootingSpecialistId);
    const statusConfig = this.fieldService.allFields.find(field => field.name === FieldNames.Car.status);
    const commentConfig = this.fieldService.allFields.find(field => field.name === FieldNames.Car.comment);

    if (statusConfig && commentConfig && shootingDateConfig && carShootingSpecialistIdConfig) {
      const shootingDateField = FieldsUtils.setFieldValue(shootingDateConfig, `${shootingDate}`);
      const carShootingSpecialistIdField = FieldsUtils.setFieldValue(carShootingSpecialistIdConfig, `${carShootingSpecialistId}`);
      const statusField = FieldsUtils.setDropdownValue(statusConfig, newStatus);
      const commentField = FieldsUtils.setFieldValue(commentConfig, comment);

      const car: ServerCar.UpdateRequest = {
        fields: [statusField, commentField, shootingDateField, carShootingSpecialistIdField]
      }
      return this.updateCar(car, id)
    } else {
      return of(false)
    }
  }

  editCarForm(id: number, carForm: RealCarForm) {
    const form = JSON.stringify(carForm);

    const worksheetConfig = this.fieldService.allFields.find(field => field.name === FieldNames.Car.worksheet);

    if (worksheetConfig) {
      const worksheetField = FieldsUtils.setFieldValue(worksheetConfig, form);

      const car: ServerCar.UpdateRequest = {
        fields: [worksheetField]
      }
      return this.updateCar(car, id)
    } else {
      return of(false)
    }
  }

  getCarFields() {
    return this.fieldService.getFieldsByDomain(FieldDomains.Car);
  }

  getCarOwnersFields() {
    return this.fieldService.getFieldsByDomain(FieldDomains.CarOwner);
  }

  addCall(carIds: number[]) {
    const url = `${environment.serverUrl}/${API}/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CALL }`;

    return this.requestService
      .post<any>(url, { carIds })
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  createCarShowing(carId: number, showingContent: CarStatistic.ShowingContent) {
    const url = `${environment.serverUrl}/${API}/${ Constants.API.STATISTIC }/${ Constants.API.CAR_SHOWING }/${carId}`;

    return this.requestService
      .post<any>(url, { showingContent })
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  updateCarShowing(carId: number, showingContent: CarStatistic.ShowingContent) {
    const url = `${environment.serverUrl}/${API}/${ Constants.API.STATISTIC }/${ Constants.API.CAR_SHOWING }/${carId}`;

    return this.requestService
      .put<any>(url, { showingContent })
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getCarStatistic(carId: number) {
    const url = `${environment.serverUrl}/${API}/${ Constants.API.STATISTIC }/${ Constants.API.CAR_SHOWING }/${carId}`;

    return this.requestService
      .get<any>(url)
      .pipe(map(result => {
        console.log(result);

        return result;
      }))
  }
}
