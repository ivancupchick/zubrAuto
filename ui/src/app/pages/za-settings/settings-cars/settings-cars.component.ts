import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DialogService } from 'primeng/dynamicdialog';
import { Subject, zip } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { getCarStatus, ServerCar } from 'src/app/entities/car';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerRole } from 'src/app/entities/role';
import { ServerUser } from 'src/app/entities/user';
import { CarService } from 'src/app/services/car/car.service';
import { SessionService } from 'src/app/services/session/session.service';
import { UserService } from 'src/app/services/user/user.service';
import { CreateCarComponent } from '../modals/create-car/create-car.component';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid.component';
import { settingsCarsStrings } from './settings-cars.strings';

export enum QueryCarTypes {
  contactCenter = 'contact-center',
  allContactCenter = 'all-contact-center'
}

@Component({
  selector: 'za-settings-cars',
  templateUrl: './settings-cars.component.html',
  styleUrls: ['./settings-cars.component.scss'],
  providers: [
    DialogService,
    CarService,
    UserService
  ]
})
export class SettingsCarsComponent implements OnInit, OnDestroy {
  sortedCars: ServerCar.Response[] = [];
  rawCars: ServerCar.Response[] = [];

  type: QueryCarTypes | '' = '';

  gridConfig!: GridConfigItem<ServerCar.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerCar.Response>[] = [{
    title: '',
    icon: 'pencil',
    buttonClass: 'secondary',
    disabled: () => this.carFieldConfigs.length === 0,
    handler: (car) => this.updateCar(car)
  }, {
    title: '',
    icon: 'times',
    buttonClass: 'danger',
    handler: (car) => this.deleteCar(car)
  }]

  carFieldConfigs: ServerField.Response[] = [];
  carOwnerFieldConfigs: ServerField.Response[] = [];
  contactCenterUsers: ServerUser.Response[] = [];

  readonly strings = settingsCarsStrings;

  destroyed = new Subject();

  constructor(private carService: CarService, private dialogService: DialogService, private route: ActivatedRoute, private sessionService: SessionService, private userService: UserService) { }

  ngOnInit(): void {
    this.type = this.route.snapshot.queryParamMap.get('type') as QueryCarTypes || '';
    this.route.queryParams
      .pipe(
        takeUntil(this.destroyed)
      )
      .subscribe(params => {
        this.type = params.type || '';
        this.sortCars();
      })

    zip(this.carService.getCarFields(), this.carService.getCarOwnersFields(), this.userService.getUsers())
      .subscribe(([carFieldConfigs, carOwnerFieldConfigs, users]) => {
        this.carFieldConfigs = carFieldConfigs;
        this.carOwnerFieldConfigs = carOwnerFieldConfigs;
        this.contactCenterUsers = users
          .filter(u => u.customRoleName === ServerRole.Custom.contactCenter
                    || u.customRoleName === ServerRole.Custom.contactCenterChief);
      });

    this.carService.getCars().subscribe((result) => {
      this.rawCars = result;
      this.sortCars();
    })

    this.gridConfig = [{
      title: this.strings.id,
      name: 'id',
      getValue: (item) => item.id,
    }, {
      title: this.strings.ownerNumber,
      name: 'ownerNumber',
      getValue: (item) => item.ownerNumber,
    }, {
      title: this.strings.status,
      name: 'status',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.status),
    }, {
      title: this.strings.engine,
      name: 'engine',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.engine),
    }, {
      title: this.strings.engineCapacity,
      name: 'engineCapacity',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.engineCapacity),
    }, {
      title: this.strings.mark,
      name: 'mark',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.mark),
    }, {
      title: this.strings.model,
      name: 'model',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.model),
    }, {
      title: this.strings.transmission,
      name: 'transmission',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.transmission),
    }, {
      title: this.strings.color,
      name: 'color',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.color),
    }];
  }

  ngOnDestroy() {
    this.destroyed.next();
  }

  updateCar(car: ServerCar.Response) {
    const ref = this.dialogService.open(CreateCarComponent, {
      data: {
        car,
        carFieldConfigs: this.carFieldConfigs,
        carOwnerFieldConfigs: this.carOwnerFieldConfigs,
        contactCenterUsers: this.contactCenterUsers
      },
      header: 'Редактировать машину',
      width: '70%'
    });
  }

  deleteCar(car: ServerCar.Response) {
    this.carService.deleteCar(car.id)
      .subscribe(res => {
        console.log(res);
      });
  }

  private sortCars() {
    switch (this.type) {
      case QueryCarTypes.contactCenter:
        this.sortedCars = this.rawCars
          .filter(c => `${FieldsUtils.getFieldValue(c, FieldNames.Car.contactCenterSpecialistId)}` === `${this.sessionService.userSubj.getValue()?.id}` && (
                       getCarStatus(c) === FieldNames.CarStatus.contactCenter_WaitingShooting
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_InProgress
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_Deny
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_MakingDecision
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_NoAnswer
          ));
        break;
      case QueryCarTypes.allContactCenter:
        this.sortedCars = this.rawCars // FIX THIS
          .filter(c => getCarStatus(c) === FieldNames.CarStatus.contactCenter_WaitingShooting
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_InProgress
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_Deny
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_MakingDecision
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_NoAnswer
          );
        break;
      default:
        this.sortedCars = this.rawCars;
    }
  }



  openNewCarWindow() {
    const ref = this.dialogService.open(CreateCarComponent, {
      data: {
        carFieldConfigs: this.carFieldConfigs,
        carOwnerFieldConfigs: this.carOwnerFieldConfigs,
        contactCenterUsers: this.contactCenterUsers
      },
      header: 'Новая машина',
      width: '70%'
    });
  }
}
