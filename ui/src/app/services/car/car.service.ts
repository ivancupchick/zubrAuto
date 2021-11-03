import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { FieldService } from '../field/field.service';
import { ServerCar } from 'src/app/entities/car';
import { map } from 'rxjs/operators';
import { Domain } from 'src/app/entities/field';
import { RequestService } from '../request/request.service';

const API = 'cars';

@Injectable()
export class CarService {

  constructor(private requestService: RequestService, private fieldService: FieldService) { }

  getCars(): Observable<ServerCar.Response[]> {
    return this.requestService.get<ServerCar.Response[]>(`${environment.serverUrl}/${API}`)
  }

  createCar(value: ServerCar.CreateRequest): Observable<boolean> {
    return this.requestService.post<never>(`${environment.serverUrl}/${API}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  // getCar(id: number): Observable<ServerCar.Response> {
  //   return this.requestService.get<ServerCar.Response[]>(`${environment.serverUrl}/${API}/${id}`)
  //     .pipe(map(result => {
  //       console.log(result);

  //       return result[0];
  //     }))
  // }

  updateCar(value: ServerCar.UpdateRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.requestService.put<any>(`${environment.serverUrl}/${API}/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteCar(id: number): Observable<boolean> {
    return this.requestService.delete<any>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getCarFields() {
    return this.fieldService.getFieldsByDomain(Domain.Car);
  }

  getCarOwnersFields() {
    return this.fieldService.getFieldsByDomain(Domain.CarOwner);
  }
}
