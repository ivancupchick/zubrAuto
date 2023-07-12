import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { FieldService } from '../field/field.service';
import { ServerFile, CarStatistic, RealCarQuestionnaire, ServerCar, UICarStatistic } from 'src/app/entities/car';
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

  getCarsByQuery(query: StringHash): Observable<ServerCar.Response[]> {
    const queries = Object.keys(query).filter(key => !!query[key]).map(key => `${key}=${query[key]}`).join('&');

    return this.requestService.get<ServerCar.Response[]>(`${environment.serverUrl}/${API}/${ Constants.API.CRUD }?${queries}`)
  }

  createCar(value: ServerCar.CreateRequest): Observable<ServerCar.IdResponse> {
    return this.requestService.post<ServerCar.IdResponse>(`${environment.serverUrl}/${API}/${ Constants.API.CRUD }`, value)
      .pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  getCar(id: number): Observable<ServerCar.Response> {
    return this.requestService.get<ServerCar.Response>(`${environment.serverUrl}/${API}/${ Constants.API.CRUD }/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  updateCar(value: ServerCar.UpdateRequest, id: number): Observable<ServerCar.IdResponse> {
    delete (value as any).id;
    return this.requestService.put<ServerCar.IdResponse>(`${environment.serverUrl}/${API}/${ Constants.API.CRUD }/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  deleteCar(id: number): Observable<ServerCar.Response> {
    return this.requestService.delete<ServerCar.Response>(`${environment.serverUrl}/${API}/${ Constants.API.CRUD }/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  deleteCars(ids: number[]): Observable<ServerCar.Response[]> {
    return this.requestService.post<ServerCar.Response[]>(`${environment.serverUrl}/${API}/${ Constants.API.DELETE_CARS }`, { carIds: ids })
      .pipe(map(result => {
        console.log(result);

        return result;
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
    return this.requestService.get<ServerFile.Response[]>(`${environment.serverUrl}/${API}/${ Constants.API.IMAGES }/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  uploadCarImages(id: number, files: File[], carImageMetadata: CarImageMetadata) {
    const metadata = JSON.stringify(carImageMetadata);

    const formData: FormData = new FormData();

    formData.append('metadata', metadata);
    formData.append('carId', `${id}`);

    files.forEach((file, i) => {
      formData.append(`file`, (file as any), (file as any).name);
    })

    return this.requestService.post<any, FormData>(`${environment.serverUrl}/${API}/${ Constants.API.IMAGES }`, formData).pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  uploadCarImage360(id: number, file: File, carImageMetadata: CarImageMetadata) {
    const metadata = JSON.stringify(carImageMetadata);

    const formData: FormData = new FormData();

    formData.append('metadata', metadata);
    formData.append('carId', `${id}`);

    formData.append(`file`, (file as any), (file as any).name);

    return this.requestService.post<any, FormData>(`${environment.serverUrl}/${API}/${ Constants.API.IMAGE360 }`, formData).pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  uploadCarStateImages(id: number, files: File[], carImageMetadata: CarImageMetadata) {
    const metadata = JSON.stringify(carImageMetadata);

    const formData: FormData = new FormData();

    formData.append('metadata', metadata);
    formData.append('carId', `${id}`);

    files.forEach((file, i) => {
      formData.append(`file`, (file as any), (file as any).name);
    })

    return this.requestService.post<any, FormData>(`${environment.serverUrl}/${API}/${ Constants.API.STATE_IMAGES }`, formData).pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  deleteCarImage(carId: number, imageId: number): Observable<boolean> {
    return this.requestService.delete<any>(`${environment.serverUrl}/${API}/${ Constants.API.IMAGES }/${carId}/${imageId}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  changeCarStatus(
    id: number,
    newStatus: FieldNames.CarStatus,
    comment = '',
    dateOfNextAction: string | undefined = undefined,
    dateOfFirstStatusChange: string | undefined = undefined
  ) {
    return this.fieldService.getFieldsByDomain(FieldDomains.Car).pipe(
      concatMap(allFields => {
        const statusConfig = allFields.find(field => field.name === FieldNames.Car.status);
        const commentConfig = allFields.find(field => field.name === FieldNames.Car.comment);
        const dateOfLastStatusChangeConfig = allFields.find(field => field.name === FieldNames.Car.dateOfLastStatusChange);
        const dateOfNextActionConfig = allFields.find(field => field.name === FieldNames.Car.dateOfNextAction);
        const dateOfFirstStatusChangeConfig = allFields.find(field => field.name === FieldNames.Car.dateOfFirstStatusChange);

        if (statusConfig && commentConfig && dateOfLastStatusChangeConfig && dateOfNextActionConfig && dateOfFirstStatusChangeConfig) {
          const statusField = FieldsUtils.setDropdownValue(statusConfig, newStatus);
          const commentField = FieldsUtils.setFieldValue(commentConfig, comment);
          const dateOfLastStatusChangeField = FieldsUtils.setFieldValue(dateOfLastStatusChangeConfig, `${+(new Date())}`);
          const dateOfNextActionField = dateOfNextAction && FieldsUtils.setFieldValue(dateOfNextActionConfig, dateOfNextAction);
          const dateOfFirstStatusChangeField = FieldsUtils.setFieldValue(dateOfFirstStatusChangeConfig, `${+(new Date())}`);

          const fields = [statusField, commentField, dateOfLastStatusChangeField]

          dateOfNextAction && dateOfNextActionField && fields.push(dateOfNextActionField);
          !dateOfFirstStatusChange && fields.push(dateOfFirstStatusChangeField);

          const car: ServerCar.UpdateRequest = {
            fields: fields
          }
          return this.updateCar(car, id)
        } else {
          return of(false)
        }
      })
    )
  }

  saveVideo(carId: number, link = '') {
    console.log(link);
    return this.fieldService.getFieldsByDomain(FieldDomains.Car).pipe(
      concatMap(allFields => {
        const linkConfig = allFields.find(field => field.name === FieldNames.Car.linkToVideo);

        console.log(linkConfig);

        if (linkConfig) {
          const linkField = FieldsUtils.setFieldValue(linkConfig, link);

          const car: ServerCar.UpdateRequest = {
            fields: [linkField]
          }
          return this.updateCar(car, carId)
        } else {
          return of(false)
        }
      })
    )
  }

  saveOldCarQuestionnaire(carId: number, oldCarQuestionnaire = '') {
    return this.fieldService.getFieldsByDomain(FieldDomains.Car).pipe(
      concatMap(allFields => {
        const oldCarQuestionnaireConfig = allFields.find(field => field.name === FieldNames.Car.oldCarQuestionnaire);

        console.log(oldCarQuestionnaireConfig);

        if (oldCarQuestionnaireConfig) {
          const oldCarQuestionnaireField = FieldsUtils.setFieldValue(oldCarQuestionnaireConfig, oldCarQuestionnaire);

          const car: ServerCar.UpdateRequest = {
            fields: [oldCarQuestionnaireField]
          }
          return this.updateCar(car, carId)
        } else {
          return of(false)
        }
      })
    )
  }

  selectMainPhoto(carId: number, photoId: number) {
    return this.fieldService.getFieldsByDomain(FieldDomains.Car).pipe(
      concatMap(allFields => {
        const mainPhotoIdConfig = allFields.find(field => field.name === FieldNames.Car.mainPhotoId);

        if (mainPhotoIdConfig) {
          const statusField = FieldsUtils.setFieldValue(mainPhotoIdConfig, `${photoId}`);

          const car: ServerCar.UpdateRequest = {
            fields: [statusField]
          }
          return this.updateCar(car, carId)
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

  editCarQuestionnaire(id: number, carQuestionnaire: RealCarQuestionnaire) {
    return this.fieldService.getFieldsByDomain(FieldDomains.Car).pipe(
      concatMap(allFields => {
        const form = JSON.stringify(carQuestionnaire);

        const carQuestionnaireConfig = allFields.find(field => field.name === FieldNames.Car.carQuestionnaire);

        if (carQuestionnaireConfig) {
          const carQuestionnaireField = FieldsUtils.setFieldValue(carQuestionnaireConfig, form);

          const car: ServerCar.UpdateRequest = {
            fields: [carQuestionnaireField]
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
