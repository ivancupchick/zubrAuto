import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { FieldService } from '../field/field.service';
import { ServerCar } from 'src/app/entities/car';
import { map } from 'rxjs/operators';
import { FieldDomains } from 'src/app/entities/field';
import { RequestService } from '../request/request.service';
import { Constants } from 'src/app/entities/constants';

const API = Constants.API.CARS;

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

  getCarFields() {
    return this.fieldService.getFieldsByDomain(FieldDomains.Car);
  }

  getCarOwnersFields() {
    return this.fieldService.getFieldsByDomain(FieldDomains.CarOwner);
  }
}
