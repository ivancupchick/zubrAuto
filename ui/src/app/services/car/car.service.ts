import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { ResponseCar } from '../../../../../src/interface/Car';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
// import { Car } from 'src/app/entities/car';

const testCars: ResponseCar[] = [{
    id: 0,
    name: 'firstCar',
    title: 'Audi A4',
    status: 'new',
    fields: [],
    ownerName: 'Анатолий',
    number: '+375448652152',
    notes: 'Позвонить в среду',
  }, {
    id: 1,
    name: 'secondCar',
    title: 'BMW X6',
    status: 'new',
    fields: [],
    ownerName: 'василий',
    number: '9856321',
    notes: 'просмотр 23 числа',
  }, {
    id: 2,
    name: 'thirdCar',
    title: 'Lexus ES',
    status: 'new',
    fields: [],
    ownerName: 'игорь',
    number: '298973265',
    notes: 'перезвонить через 10 недель',
}]

@Injectable({
  providedIn: 'root',
})
export class CarService {

  constructor(private httpClient: HttpClient) { }

  getCars(): Observable<ResponseCar[]> {
    // this.httpClient.get(`${environment.serverUrl}/cars`).subscribe(r => {
    //   console.log(r);
    // })
    return of(testCars);
  }
}
