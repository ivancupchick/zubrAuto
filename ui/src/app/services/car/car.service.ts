import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { FieldService } from '../field/field.service';
import { CarImage, CarStatistic, RealCarForm, ServerCar, UICarStatistic } from 'src/app/entities/car';
import { concatMap, map, mergeMap } from 'rxjs/operators';
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
    return this.fieldService.getFieldsByDomain(FieldDomains.Car).pipe(
      concatMap(allFields => {
        const statusConfig = allFields.find(field => field.name === FieldNames.Car.status);
        const commentConfig = allFields.find(field => field.name === FieldNames.Car.comment);

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
      })
    )


  }

  transformToCarShooting(id: number, shootingDate: number, carShootingSpecialistId: number, comment = '') {
      return this.fieldService.getFieldsByDomain(FieldDomains.Car).pipe(
        concatMap(allFields => {
          const newStatus = FieldNames.CarStatus.carShooting_InProgres;

          const shootingDateConfig = allFields.find(field => field.name === FieldNames.Car.shootingDate);
          const carShootingSpecialistIdConfig = allFields.find(field => field.name === FieldNames.Car.carShootingSpecialistId);
          const statusConfig = allFields.find(field => field.name === FieldNames.Car.status);
          const commentConfig = allFields.find(field => field.name === FieldNames.Car.comment);

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
        })
      );
  }

  editCarForm(id: number, carForm: RealCarForm) {
    return this.fieldService.getFieldsByDomain(FieldDomains.Car).pipe(
      concatMap(allFields => {
        const form = JSON.stringify(carForm);

        const worksheetConfig = allFields.find(field => field.name === FieldNames.Car.worksheet);

        if (worksheetConfig) {
          const worksheetField = FieldsUtils.setFieldValue(worksheetConfig, form);

          const car: ServerCar.UpdateRequest = {
            fields: [worksheetField]
          }
          return this.updateCar(car, id)
        } else {
          return of(false)
        }
      })
    );
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

  addCustomerCall(carId: number) {
    const url = `${environment.serverUrl}/${API}/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CUSTOMER_CALL }/${carId}`;

    return this.requestService
      .post<any>(url, {})
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  addCustomerDiscount(carId: number, discount: number, amount: number) {
    const url = `${environment.serverUrl}/${API}/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CUSTOMER_DISCOUNT }/${carId}`;

    return this.requestService
      .post<any>(url, { discount, amount })
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

  updateCarShowing(carId: number, showingId: number, showingContent: CarStatistic.ShowingContent) {
    const url = `${environment.serverUrl}/${API}/${ Constants.API.STATISTIC }/${ Constants.API.CAR_SHOWING }/${carId}`;

    return this.requestService
      .put<any>(url, { showingContent, showingId })
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getShowingCarStatistic(carId: number) {
    const url = `${environment.serverUrl}/${API}/${ Constants.API.STATISTIC }/${ Constants.API.CAR_SHOWING }/${carId}`;

    return this.requestService
      .get<CarStatistic.CarShowingResponse[]>(url)
      .pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  // Observable<UICarStatistic[]>
  getAllCarStatistic(carId: number) {
    const url = `${environment.serverUrl}/${API}/${ Constants.API.STATISTIC }/${carId}`;

    return this.requestService
      .get<(CarStatistic.CarShowingResponse | CarStatistic.BaseResponse)[]>(url)
      .pipe(
        map(result => {
          return result.map(record => {
            let type = UICarStatistic.StatisticType.None;

            switch (record.type) {
              case CarStatistic.Type.call:
                type = UICarStatistic.StatisticType.Call
                break;
              case CarStatistic.Type.customerDiscount:
                type = UICarStatistic.StatisticType.Discount
                break;
              case CarStatistic.Type.showing:
                const content = record.content as CarStatistic.ShowingContent;
                if (content.status === CarStatistic.ShowingStatus.success) {
                  type = UICarStatistic.StatisticType.SuccessShowing;
                }

                if (content.status === CarStatistic.ShowingStatus.plan) {
                  type = UICarStatistic.StatisticType.PlanShowing;
                }
                break;
            }

            const item: UICarStatistic.Item = {
              date: new Date(+record.date),
              type,
              content: record.content
            }

            return item;
          });
        }
      ))
  }
}
