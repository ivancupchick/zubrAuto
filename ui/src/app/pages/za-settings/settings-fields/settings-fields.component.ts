import { Component, OnInit } from '@angular/core';
import { Car } from 'src/app/entities/car';
import { CarService } from 'src/app/services/car/car.service';

export interface GridCar {
  name: string;
  title: string;
  status: string;
}

@Component({
  selector: 'za-settings-fields',
  templateUrl: './settings-fields.component.html',
  styleUrls: ['./settings-fields.component.scss']
})
export class SettingsFieldsComponent implements OnInit {
  cars: GridCar[] = [];

  constructor(private carService: CarService) { }

  ngOnInit(): void {
    this.carService.getCars().subscribe(res => {
      this.cars = res.map(car => {
        const gridCar = {
          name: car.name,
          title: car.title,
          status: car.status,
        }

        return gridCar;
      })
    })
    // this.cars = th
  }

}
