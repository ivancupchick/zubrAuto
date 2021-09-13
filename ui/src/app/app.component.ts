import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { CarService } from './services/car/car.service';

@Component({
  selector: 'za-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    HttpClient,
    
  ]
})
export class AppComponent {
  title = 'zubr-auto';

  constructor(carService: CarService) {
    carService.getCars();
  }
}
