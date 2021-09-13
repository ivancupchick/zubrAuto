import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'
import { ResponseCar } from '../../../../../src/interface/Car';
// import { Car } from 'src/app/entities/car';

@Injectable({
  providedIn: 'root',
})
export class CarService {

  constructor(private httpClient: HttpClient) { }

  getCars(): ResponseCar[] {
    this.httpClient.get('http://localhost:3080/cars').subscribe(r => {
      console.log(r);
    })
    return [];
  }
}
