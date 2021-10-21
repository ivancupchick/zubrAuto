import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { FieldService } from '../field/field.service';
import { ServerCar } from 'src/app/entities/car';
import { map } from 'rxjs/operators';
import { Domain, ServerField } from 'src/app/entities/field';

const API = 'cars';

@Injectable()
export class CarService {

  constructor(private httpClient: HttpClient, private fieldService: FieldService) { }

  getCars(): Observable<ServerCar.GetResponse[]> {
    return this.httpClient.get<ServerCar.GetResponse[]>(`${environment.serverUrl}/${API}`)
  }

  createCar(value: ServerCar.CreateRequest): Observable<boolean> {
    return this.httpClient.post<never>(`${environment.serverUrl}/${API}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  // getCar(id: number): Observable<ServerCar.GetResponse> {
  //   return this.httpClient.get<ServerCar.GetResponse[]>(`${environment.serverUrl}/${API}/${id}`)
  //     .pipe(map(result => {
  //       console.log(result);

  //       return result[0];
  //     }))
  // }

  updateCar(value: ServerCar.UpdateRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.httpClient.put<any>(`${environment.serverUrl}/${API}/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteCar(id: number): Observable<boolean> {
    return this.httpClient.delete<any>(`${environment.serverUrl}/${API}/${id}`)
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
