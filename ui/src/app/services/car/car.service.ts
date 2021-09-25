import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { Car } from 'src/app/entities/car';

const testCars: Car[] = [{
  id: 0,
  createdDate: (new Date()).getDate(),
  ownerId: 0,
  fields: [{
    id: 1,
    flags: 0,
    type: 0,
    name: 'name',
    domain: 0,
    variants: '',
    showUserLevel: 0,
    value: 'firstCar'
  }, {
    id: 1,
    flags: 0,
    type: 0,
    name: 'title',
    domain: 0,
    variants: '',
    showUserLevel: 0,
    value: 'Audi A4'
  }, {
    id: 1,
    flags: 0,
    type: 0,
    name: 'status',
    domain: 0,
    variants: '',
    showUserLevel: 0,
    value: 'new'
  }, {
    id: 1,
    flags: 0,
    type: 0,
    name: 'ownerName',
    domain: 0,
    variants: '',
    showUserLevel: 0,
    value: 'Анатолий'
  }, {
    id: 1,
    flags: 0,
    type: 0,
    name: 'number',
    domain: 0,
    variants: '',
    showUserLevel: 0,
    value: '+375448652152'
  }, {
    id: 1,
    flags: 0,
    type: 0,
    name: 'notes',
    domain: 0,
    variants: '',
    showUserLevel: 0,
    value: 'Позвонить в среду'
  }],
  }, {
    id: 1,
    createdDate: (new Date()).getDate(),
    ownerId: 2,
    fields: [{
      id: 1,
      flags: 0,
      type: 0,
      name: 'name',
      domain: 0,
      variants: '',
      showUserLevel: 0,
      value: 'secondCar'
    }, {
      id: 1,
      flags: 0,
      type: 0,
      name: 'title',
      domain: 0,
      variants: '',
      showUserLevel: 0,
      value: 'BMW X6'
    }, {
      id: 1,
      flags: 0,
      type: 0,
      name: 'status',
      domain: 0,
      variants: '',
      showUserLevel: 0,
      value: 'new'
    }, {
      id: 1,
      flags: 0,
      type: 0,
      name: 'ownerName',
      domain: 0,
      variants: '',
      showUserLevel: 0,
      value: 'василий'
    }, {
      id: 1,
      flags: 0,
      type: 0,
      name: 'number',
      domain: 0,
      variants: '',
      showUserLevel: 0,
      value: '9856321'
    }, {
      id: 1,
      flags: 0,
      type: 0,
      name: 'notes',
      domain: 0,
      variants: '',
      showUserLevel: 0,
      value: 'просмотр 23 числа'
    }],
}]

@Injectable({
  providedIn: 'root',
})
export class CarService {

  constructor(private httpClient: HttpClient) { }

  getCars(): Observable<Car[]> {
    // this.httpClient.get(`${environment.serverUrl}/cars`).subscribe(r => {
    //   console.log(r);
    // })
    return of(testCars);
  }
}
