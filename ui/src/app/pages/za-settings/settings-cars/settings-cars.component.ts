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
import { ChangeCarStatusComponent } from '../modals/change-car-status/change-car-status.component';
import { CreateCarFormComponent } from '../modals/create-car-form/create-car-form.component';
import { CreateCarComponent } from '../modals/create-car/create-car.component';
import { TransformToCarShooting } from '../modals/transform-to-car-shooting/transform-to-car-shooting.component';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid.component';
import { settingsCarsStrings } from './settings-cars.strings';

export enum QueryCarTypes {
  myCallBase = 'my-call-base',
  allCallBase = 'all-call-base',
  myShootingBase = 'my-shooting-base',
  allShootingBase = 'all-shooting-base',
  carsForSale = 'cars-for-sale',
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
  gridActionsConfig!: GridActionConfigItem<ServerCar.Response>[];

  carFieldConfigs: ServerField.Response[] = [];
  carOwnerFieldConfigs: ServerField.Response[] = [];
  contactCenterUsers: ServerUser.Response[] = [];
  carShootingUsers: ServerUser.Response[] = [];

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
        this.carShootingUsers = users
          .filter(u => u.customRoleName === ServerRole.Custom.carShooting
                    || u.customRoleName === ServerRole.Custom.carShootingChief);
      });

    this.carService.getCars().subscribe((result) => {
      this.rawCars = result;
      this.sortCars();
    })

    this.gridConfig = this.getGridConfig();
    this.gridActionsConfig = this.getGridActionsConfig();

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
        contactCenterUsers: this.contactCenterUsers,
        carShootingUsers: this.carShootingUsers,
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
      case QueryCarTypes.myCallBase:
        this.sortedCars = this.rawCars
          .filter(c => `${FieldsUtils.getFieldValue(c, FieldNames.Car.contactCenterSpecialistId)}` === `${this.sessionService.userSubj.getValue()?.id}` && (
                       getCarStatus(c) === FieldNames.CarStatus.contactCenter_WaitingShooting
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_InProgress
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_Deny
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_MakingDecision
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_NoAnswer
          ));
        break;
      case QueryCarTypes.allCallBase:
        this.sortedCars = this.rawCars // FIX THIS
          .filter(c => getCarStatus(c) === FieldNames.CarStatus.contactCenter_WaitingShooting
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_InProgress
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_Deny
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_MakingDecision
                    || getCarStatus(c) === FieldNames.CarStatus.contactCenter_NoAnswer
          );
        break;
      case QueryCarTypes.myShootingBase:
        this.sortedCars = this.rawCars
          .filter(c => `${FieldsUtils.getFieldValue(c, FieldNames.Car.carShootingSpecialistId)}` === `${this.sessionService.userSubj.getValue()?.id}` && (
                       getCarStatus(c) === FieldNames.CarStatus.carShooting_InProgres
                    || getCarStatus(c) === FieldNames.CarStatus.carShooting_Refund
          ));
        break;
      case QueryCarTypes.allShootingBase:
        this.sortedCars = this.rawCars
          .filter(c => getCarStatus(c) === FieldNames.CarStatus.carShooting_InProgres
                    || getCarStatus(c) === FieldNames.CarStatus.carShooting_Refund
                    || getCarStatus(c) === FieldNames.CarStatus.carShooting_Ready
          );
        break;
      case QueryCarTypes.carsForSale:
        this.sortedCars = this.rawCars
          .filter(c => getCarStatus(c) === FieldNames.CarStatus.customerService_InProgress
                    || getCarStatus(c) === FieldNames.CarStatus.carShooting_Refund
                    // || getCarStatus(c) === FieldNames.CarStatus.customerService_InProgress
                    // || getCarStatus(c) === FieldNames.CarStatus.customerService_Ready
          );
        break;
      default:
        this.sortedCars = this.rawCars;
    }
  }

  private getGridConfig(): GridConfigItem<ServerCar.Response>[] {
    const configs: GridConfigItem<ServerCar.Response>[] = [{
      title: this.strings.id,
      name: 'id',
      getValue: (item) => item.id, // TODO! ,
    }, {
      title: this.strings.date,
      name: 'CreatedDate',
      getValue: (item) => {
        try {
          const date = new Date(+item.createdDate);
          return date instanceof Date ? `${date.getDay()}/${date.getMonth()}/${date.getFullYear()}` : ''
        } catch (error) {
          console.error(error);
          return item.createdDate
        }
      },
      available: () => !(this.sessionService.isCarSales || this.sessionService.isCarSalesChief),
    }, {
      title: this.strings.source,
      name: 'source',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.source),
      available: () => !(this.sessionService.isCarSales || this.sessionService.isCarSalesChief),
    }, {
      title: this.strings.ownerName,
      name: 'ownerName',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.CarOwner.name),
      available: () => !(this.sessionService.isCarSales || this.sessionService.isCarSalesChief),
    }, {
      title: this.strings.ownerNumber,
      name: 'ownerNumber',
      getValue: (item) => item.ownerNumber,
      available: () => !(this.sessionService.isCarSales || this.sessionService.isCarSalesChief),
    }, {
      title: this.strings.brandAndModel,
      name: 'brandAndModel',
      getValue: (item) => `${FieldsUtils.getFieldValue(item, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(item, FieldNames.Car.model)}`,
    }, {
      title: this.strings.year,
      name: 'year',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.year),
    }, {
      title: this.strings.worksheet,
      name: 'worksheet',
      getValue: (item) => '', // TODO! specific fields? FieldsUtils.getFieldValue(item, FieldNames.Car.worksheet),
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief
    }, {
      title: this.strings.engine,
      name: 'engine',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.engine),
    }, {
      title: this.strings.engineCapacity,
      name: 'engineCapacity',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.engineCapacity),
    }, {
      title: this.strings.transmission,
      name: 'transmission',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.transmission),
    }, {
      title: this.strings.color,
      name: 'color',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.color),
    }, {
      title: this.strings.driveType,
      name: 'driveType',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.driveType).split(' ')[1],
    }, {
      title: this.strings.mileage,
      name: 'mileage',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.mileage),
    }, {
      title: this.strings.linkToAd,
      name: 'linkToAd',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.linkToAd),
      available: () => !(this.sessionService.isCarSales || this.sessionService.isCarSalesChief),
    },
    // {
    //   title: this.strings.trueCarPrice,
    //   name: 'trueCarPrice',
    //   getValue: (item) => '',
    //   available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief,
    // },
    {
      title: this.sessionService.isCarShooting
          || this.sessionService.isCarShootingChief
          || this.sessionService.isCustomerService
          || this.sessionService.isCustomerServiceChief
          || this.sessionService.isCarSales
          || this.sessionService.isCarSalesChief
        ? this.strings.trueCarPrice
        : this.strings.carOwnerPrice, // TODO!
      name: 'carOwnerPrice',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.carOwnerPrice),
    }, {
      title: this.strings.commission,
      name: 'commission',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.commission),
    }, {
      title: this.strings.bargain,
      name: 'bargain',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.bargain),
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief
                    || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief
                    || this.sessionService.isCarSales || this.sessionService.isCarSalesChief,
    }, {
      title: this.strings.adPrice,
      name: 'adPrice',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.adPrice),
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief
                    || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief
                    || this.sessionService.isCarSales || this.sessionService.isCarSalesChief,
    }, {
      title: this.strings.status,
      name: 'status',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.status),
      available: () => !(this.sessionService.isCarSales || this.sessionService.isCarSalesChief),
    }, {
      title: this.strings.comment,
      name: 'comment',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.comment),
      available: () => this.sessionService.isContactCenter || this.sessionService.isContactCenterChief,
    }, {
      title: this.strings.shootingDate,
      name: 'shootingDate',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.shootingDate),
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    }, {
      title: this.strings.shootingTime,
      name: 'shootingTime',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.shootingTime),
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    }, {
      title: this.strings.photos,
      name: 'photos',
      getValue: (item) => '', // TODO! specific fields
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    }, {
      title: this.strings.photo360,
      name: 'photo360',
      getValue: (item) => '', // TODO! specific fields
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    }, {
      title: this.strings.linkToVideo,
      name: 'linkToVideo',
      getValue: (item) => '', // TODO! specific fields
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    }, {
      title: this.strings.ourLinks,
      name: 'ourLinks',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.ourLinks),
      available: () => this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    },
    // {
    //   title: this.strings.nextAction,
    //   name: 'nextAction',
    //   getValue: (item) => '', // TODO! specific field???
    //   available: () => this.sessionService.isContactCenter || this.sessionService.isContactCenterChief,
    // }, {
    //   title: this.strings.dateOfLastStatusChange,
    //   name: 'dateOfLastStatusChange',
    //   getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.dateOfLastStatusChange),
    //   available: () => this.sessionService.isContactCenter || this.sessionService.isContactCenterChief,
    // }
    ];





    return configs.filter(config => !config.available || config.available());
  }

  private getGridActionsConfig(): GridActionConfigItem<ServerCar.Response>[] {
    const configs: GridActionConfigItem<ServerCar.Response>[] = [{
      title: '',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: () => this.carFieldConfigs.length === 0,
      available: () => this.sessionService.isAdminOrHigher || this.sessionService.isCarShooting || this.sessionService.isCarShootingChief,
      handler: (car) => this.updateCar(car),
    }, {
      title: '',
      icon: 'times',
      buttonClass: 'danger',
      available: () => this.sessionService.isAdminOrHigher,
      handler: (car) => this.deleteCar(car),
    }, {
      title: '',
      icon: 'mobile',
      buttonClass: 'secondary',
      available: () => this.sessionService.isAdminOrHigher || this.sessionService.isContactCenter || this.sessionService.isContactCenterChief,
      handler: (car) => this.contactCenterCall(car),
    }, {
      title: '',
      icon: 'check',
      buttonClass: 'primary',
      available: () => this.sessionService.isAdminOrHigher || this.sessionService.isContactCenterChief,
      handler: (car) => this.transformToCarShooting(car),
    }, {
      title: '',
      icon: 'id-card',
      buttonClass: 'secondary',
      available: () => this.sessionService.isAdminOrHigher || this.sessionService.isCarShooting || this.sessionService.isCarShootingChief,
      handler: (car) => this.createOrEditCarForm(car),
    }, {
      title: '',
      icon: 'camera',
      buttonClass: 'secondary',
      available: () => this.sessionService.isAdminOrHigher || this.sessionService.isCarShooting || this.sessionService.isCarShootingChief,
      handler: (car) => this.uploadMedia(car),
    }, {
      title: '',
      icon: 'caret-left',
      buttonClass: 'danger',
      available: () => this.sessionService.isAdminOrHigher || this.sessionService.isCarShooting || this.sessionService.isCarShootingChief,
      handler: (car) => this.returnToContactCenter(car),
    }, {
      title: '',
      icon: 'caret-right',
      buttonClass: 'primary',
      available: () => this.sessionService.isAdminOrHigher || this.sessionService.isCarShooting || this.sessionService.isCarShootingChief,
      handler: (car) => this.transformToCustomerService(car),
    }];

    return configs.filter(config => !config.available || config.available());
  }

  openNewCarWindow() {
    const ref = this.dialogService.open(CreateCarComponent, {
      data: {
        carFieldConfigs: this.carFieldConfigs,
        carOwnerFieldConfigs: this.carOwnerFieldConfigs,
        contactCenterUsers: this.contactCenterUsers,
        carShootingUsers: this.carShootingUsers,
      },
      header: 'Новая машина',
      width: '70%'
    });
  }

  contactCenterCall(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.contactCenter_MakingDecision,
          FieldNames.CarStatus.contactCenter_NoAnswer,
          FieldNames.CarStatus.contactCenter_WaitingShooting,
          FieldNames.CarStatus.contactCenter_InProgress
        ],
      },
      header: 'Звонок',
      width: '70%'
    });
  }

  transformToCarShooting(car: ServerCar.Response) {
    const ref = this.dialogService.open(TransformToCarShooting, {
      data: {
        carId: car.id,
        // carOwnerFieldConfigs: this.carOwnerFieldConfigs,
        // contactCenterUsers: this.contactCenterUsers,
        // carShootingUsers: this.carShootingUsers,
      },
      header: 'Звонок',
      width: '70%',
      height: '60%',
    });
  }

  createOrEditCarForm(car: ServerCar.Response) {
    const ref = this.dialogService.open(CreateCarFormComponent, {
      data: {
        car: car,
        // carOwnerFieldConfigs: this.carOwnerFieldConfigs,
        // contactCenterUsers: this.contactCenterUsers,
        // carShootingUsers: this.carShootingUsers,
      },
      header: 'Анкета',
      width: '90%',
      height: '90%',
    });
  }

  uploadMedia(car: ServerCar.Response) {
    // const ref = this.dialogService.open(TransformToCarShooting, {
    //   data: {
    //     carId: car.id,
    //     // carOwnerFieldConfigs: this.carOwnerFieldConfigs,
    //     // contactCenterUsers: this.contactCenterUsers,
    //     // carShootingUsers: this.carShootingUsers,
    //   },
    //   header: 'Звонок',
    //   width: '70%',
    //   height: '60%',
    // });
  }

  returnToContactCenter(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.contactCenter_Refund,
        ],
        commentIsRequired: true,
      },
      header: 'Вернуть отделу ОКЦ',
      width: '70%',
    });
  }

  transformToCustomerService(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.carShooting_Ready,
        ],
      },
      header: 'Передать отделу ОРК',
      width: '70%',
    });
  }
}
