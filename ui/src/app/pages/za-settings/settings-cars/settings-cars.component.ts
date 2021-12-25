import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, zip } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { getCarStatus, ServerCar } from 'src/app/entities/car';
import { FieldsUtils, ServerField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerRole } from 'src/app/entities/role';
import { ServerUser } from 'src/app/entities/user';
import { DateUtils } from 'src/app/entities/utils';
import { CarService } from 'src/app/services/car/car.service';
import { SessionService } from 'src/app/services/session/session.service';
import { UserService } from 'src/app/services/user/user.service';
import { ChangeCarStatusComponent } from '../modals/change-car-status/change-car-status.component';
import { CreateCarFormComponent } from '../modals/create-car-form/create-car-form.component';
import { CreateCarComponent } from '../modals/create-car/create-car.component';
import { TransformToCarShooting } from '../modals/transform-to-car-shooting/transform-to-car-shooting.component';
import { UploadCarMediaComponent } from '../modals/upload-car-media/upload-car-media.component';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid.component';
import { settingsCarsStrings } from './settings-cars.strings';

function calculateBargain(price: number) {
  let bargain = 0;

  if (price < 10000) {
    bargain = 200;
  } else if (10000 <= price && price < 15000) {
    bargain = 200;
  } else if (15000 <= price && price < 20000) {
    bargain = 200;
  } else if (20000 <= price && price < 30000) {
    bargain = 300;
  } else if (30000 <= price && price < 40000) {
    bargain = 500;
  } else if (40000 <= price && price < 50000) {
    bargain = 1000;
  } else if (50000 <= price) {
    bargain = 1000;
  }

  return bargain;
}

function calculateComission(price: number) {
  let commission = 0;

  if (price < 10000) {
    commission = 400;
  } else if (10000 <= price && price < 15000) {
    commission = 500;
  } else if (15000 <= price && price < 20000) {
    commission = 600;
  } else if (20000 <= price && price < 30000) {
    commission = 700;
  } else if (30000 <= price && price < 40000) {
    commission = 800;
  } else if (40000 <= price && price < 50000) {
    commission = 900;
  } else if (50000 <= price) {
    commission = 1000;
  }

  return commission;
}

export enum QueryCarTypes {
  myCallBase = 'my-call-base',
  allCallBase = 'all-call-base',
  myShootingBase = 'my-shooting-base',
  allShootingBase = 'all-shooting-base',
  shootedBase = 'shooted-base',
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
  get addCarButtonAvailable() {
    return !this.isSelectCarModalMode && !this.sessionService.isCarSales && !this.sessionService.isCarSalesChief
  }

  sortedCars: ServerCar.Response[] = [];
  rawCars: ServerCar.Response[] = [];

  loading = false;

  type: QueryCarTypes | '' = '';

  @Input() isSelectCarModalMode = false;
  @Input() selected: ServerCar.Response[] = [];
  @Output() onSelectCar = new EventEmitter<ServerCar.Response[]>();

  isSearchAvailable = true;

  gridConfig!: GridConfigItem<ServerCar.Response>[];
  gridActionsConfig!: GridActionConfigItem<ServerCar.Response>[];

  carFieldConfigs: ServerField.Response[] = [];
  carOwnerFieldConfigs: ServerField.Response[] = [];
  contactCenterUsers: ServerUser.Response[] = [];
  carShootingUsers: ServerUser.Response[] = [];

  availableStatuses: { key: FieldNames.CarStatus | 'Все', value: FieldNames.CarStatus | 'Все' }[] = [];
  selectedStatus: FieldNames.CarStatus | 'Все' | null = 'Все';

  readonly strings = settingsCarsStrings;

  destroyed = new Subject();

  constructor(private carService: CarService, private dialogService: DialogService, private route: ActivatedRoute, private sessionService: SessionService, private userService: UserService) { }

  ngOnInit(): void {
    this.type = !this.isSelectCarModalMode
      ? this.route.snapshot.queryParamMap.get('type') as QueryCarTypes || ''
      : QueryCarTypes.carsForSale;

    this.route.queryParams
      .pipe(
        takeUntil(this.destroyed)
      )
      .subscribe(params => {
        this.type = params.type || '';

        this.setGridSettings();
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

    this.getCars().subscribe();

    this.setGridSettings();
  }

  getCars() {
    return this.carService.getCars().pipe(
        tap((res => {
          this.rawCars = [...res];
          this.sortCars();
        }))
      )
  }

  subscribeOnCloseModalRef(ref: DynamicDialogRef) {
    ref.onClose
      .subscribe(res => {
        if (res) {
          this.loading = true;
          // this.carService.getCars().subscribe((result) => {
          //   this.rawCars = result;
          //   this.sortCars();
          // })
          this.getCars().subscribe(() => {
            this.loading = false;
          });
        }
      })
  }

  setGridSettings() {
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

    this.subscribeOnCloseModalRef(ref);
  }

  deleteCar(car: ServerCar.Response) {
    this.carService.deleteCar(car.id)
      .subscribe(res => {
        console.log(res);
      });
  }

  sortCars(searchText = '') {
    switch (this.type) {
      case QueryCarTypes.myCallBase:
        const availableStatuses = [
          FieldNames.CarStatus.contactCenter_WaitingShooting,
          FieldNames.CarStatus.contactCenter_InProgress,
          FieldNames.CarStatus.contactCenter_Deny,
          FieldNames.CarStatus.contactCenter_MakingDecision,
          FieldNames.CarStatus.contactCenter_NoAnswer,
        ];
        this.availableStatuses = [
          {
            key: 'Все', value: 'Все'
          },
          ...availableStatuses.map(s => ({ key: s, value: s }))
        ];
        this.sortedCars = this.rawCars
          .filter(c => `${FieldsUtils.getFieldValue(c, FieldNames.Car.contactCenterSpecialistId)}` === `${this.sessionService.userSubj.getValue()?.id}` && (
                       getCarStatus(c) === this.selectedStatus || 'Все' === this.selectedStatus
          ));
        break;
      case QueryCarTypes.allCallBase:
        const availableStatuses2 = [
          FieldNames.CarStatus.contactCenter_WaitingShooting,
          FieldNames.CarStatus.contactCenter_InProgress,
          FieldNames.CarStatus.contactCenter_Deny,
          FieldNames.CarStatus.contactCenter_MakingDecision,
          FieldNames.CarStatus.contactCenter_NoAnswer,
        ];
        this.availableStatuses = [{
          key: 'Все', value: 'Все'
        },
          ...availableStatuses2.map(s => ({ key: s, value: s }))]

        this.sortedCars = this.rawCars // FIX THIS
          .filter(c => getCarStatus(c) === this.selectedStatus  || 'Все' === this.selectedStatus);
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
                    // || getCarStatus(c) === FieldNames.CarStatus.customerService_InProgress
                    // || getCarStatus(c) === FieldNames.CarStatus.customerService_Ready
          );
        break;
      case QueryCarTypes.shootedBase:
        this.sortedCars = this.rawCars
          .filter(c => getCarStatus(c) === FieldNames.CarStatus.carShooting_Ready
                    // || getCarStatus(c) === FieldNames.CarStatus.customerService_InProgress
                    // || getCarStatus(c) === FieldNames.CarStatus.customerService_Ready
          );
        break;
      default:
        this.sortedCars = this.rawCars;
    }

    this.sortedCars = this.sortedCars.filter(car => {
      const name = `${FieldsUtils.getFieldValue(car, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(car, FieldNames.Car.model)}`

      return name.toLocaleLowerCase().indexOf(searchText.toLocaleLowerCase()) !== -1
    })
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
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.worksheet) ? 'Есть' : 'Нет',
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
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.driveType),
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
      getValue: (item) => `${FieldsUtils.getFieldValue(item, FieldNames.Car.carOwnerPrice)}$`,
    }, {
      title: this.strings.commission,
      name: 'commission',
      getValue: (item) => {
        const price = +(FieldsUtils.getFieldValue(item, FieldNames.Car.carOwnerPrice) || 0);
        return `${calculateComission(price)}$`;
      },
    }, {
      title: this.strings.bargain,
      name: 'bargain',
      getValue: (item) => {
        const price = +(FieldsUtils.getFieldValue(item, FieldNames.Car.carOwnerPrice) || 0);
        return `${calculateBargain(price)}$`;
      },
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief
                    || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief
                    || this.sessionService.isCarSales || this.sessionService.isCarSalesChief,
    }, {
      title: this.strings.adPrice,
      name: 'adPrice',
      getValue: (item) => {
        const price = +(FieldsUtils.getFieldValue(item, FieldNames.Car.carOwnerPrice) || 0);

        return `${calculateComission(price) + calculateBargain(price) + price}$`;
      },
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
      getValue: (item) => DateUtils.getFormatedDate(+(FieldsUtils.getFieldValue(item, FieldNames.Car.shootingDate) || 0)),
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    }, {
      title: this.strings.shootingTime,
      name: 'shootingTime',
      getValue: (item) => moment(new Date(+(FieldsUtils.getFieldValue(item, FieldNames.Car.shootingDate) || 0))).format('HH:mm'),
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    },
    // {
    //   title: this.strings.photos,
    //   name: 'photos',
    //   getValue: (item) => '', // TODO! specific fields
    //   available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    // }, {
    //   title: this.strings.photo360,
    //   name: 'photo360',
    //   getValue: (item) => '', // TODO! specific fields
    //   available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    // }, {
    //   title: this.strings.linkToVideo,
    //   name: 'linkToVideo',
    //   getValue: (item) => '', // TODO! specific fields
    //   available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    // },
    {
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
      available: () => this.sessionService.isAdminOrHigher
                    || this.sessionService.isCarShooting
                    || this.sessionService.isCarShootingChief
                    || this.sessionService.isCustomerService
                    || this.sessionService.isCustomerServiceChief,
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
      available: () => this.sessionService.isAdminOrHigher
                    || this.sessionService.isCarShooting
                    || this.sessionService.isCarShootingChief
                    || this.sessionService.isCarSales
                    || this.sessionService.isCarSalesChief
                    || this.sessionService.isCustomerService
                    || this.sessionService.isCustomerServiceChief,
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
    }, {
      title: '',
      icon: 'caret-left',
      buttonClass: 'danger',
      available: () => this.type === QueryCarTypes.shootedBase && (
           this.sessionService.isAdminOrHigher
        || this.sessionService.isCustomerService
        || this.sessionService.isCustomerServiceChief),
      handler: (car) => this.returnToShootingCar(car),
    }, {
      title: '',
      icon: 'caret-right',
      buttonClass: 'primary',
      available: () => this.type === QueryCarTypes.shootedBase && (
          this.sessionService.isAdminOrHigher
       || this.sessionService.isCustomerService
       || this.sessionService.isCustomerServiceChief),
      handler: (car) => this.transformToCustomerServiceAprooved(car),
    }, {
      title: '',
      icon: 'pause',
      buttonClass: 'primary',
      available: () => this.type === QueryCarTypes.carsForSale && (
          this.sessionService.isAdminOrHigher
       || this.sessionService.isCustomerService
       || this.sessionService.isCustomerServiceChief),
      handler: (car) => this.transformToCustomerServicePause(car),
    }, {
      title: '',
      icon: 'times',
      buttonClass: 'danger',
      available: () => this.type === QueryCarTypes.carsForSale && (
          this.sessionService.isAdminOrHigher
       || this.sessionService.isCustomerService
       || this.sessionService.isCustomerServiceChief),
      handler: (car) => this.transformToCustomerServiceDelete(car),
    }, {
      title: '',
      icon: 'mobile',
      buttonClass: 'secondary',
      available: () => this.type === QueryCarTypes.carsForSale && (
          this.sessionService.isAdminOrHigher
       || this.sessionService.isCustomerService
       || this.sessionService.isCustomerServiceChief),
      handler: (car) => this.сustomerServiceCall(car),
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

    this.subscribeOnCloseModalRef(ref);
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
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: 'Звонок',
      width: '70%'
    });

    this.subscribeOnCloseModalRef(ref);
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
      // height: '60%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  createOrEditCarForm(car: ServerCar.Response) {
    const ref = this.dialogService.open(CreateCarFormComponent, {
      data: {
        car: car,
        readOnly: this.sessionService.isCarSales || this.sessionService.isCarSalesChief,
        // carOwnerFieldConfigs: this.carOwnerFieldConfigs,
        // contactCenterUsers: this.contactCenterUsers,
        // carShootingUsers: this.carShootingUsers,
      },
      header: 'Анкета',
      width: '90%',
      height: '90%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  uploadMedia(car: ServerCar.Response) {
    const ref = this.dialogService.open(UploadCarMediaComponent, {
      data: {
        car,
        // carOwnerFieldConfigs: this.carOwnerFieldConfigs,
        // contactCenterUsers: this.contactCenterUsers,
        // carShootingUsers: this.carShootingUsers,
      },
      header: 'Загрузка медиа файлов',
      width: '90%',
      height: '90%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  returnToContactCenter(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.contactCenter_Refund,
        ],
        commentIsRequired: true,
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: 'Вернуть отделу ОКЦ',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  returnToShootingCar(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.carShooting_Refund,
        ],
        commentIsRequired: true,
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: 'Вернуть отделу ОСА',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  transformToCustomerService(car: ServerCar.Response) {
    if (!FieldsUtils.getFieldValue(car, FieldNames.Car.worksheet)) {
      alert('У авто нету анкеты!');
      return;
    }


    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.carShooting_Ready,
        ],
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: 'Передать отделу ОРК',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  transformToCustomerServiceAprooved(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.customerService_InProgress,
        ],
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: 'Подтвердить',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  transformToCustomerServicePause(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.customerService_OnPause,
        ],
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: 'Пауза',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  transformToCustomerServiceDelete(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.customerService_OnDelete,
        ],
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: 'Поставить на удаление',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  сustomerServiceCall(car: ServerCar.Response) {
    // const ref = this.dialogService.open(ChangeCarStatusComponent, {
    //   data: {
    //     carId: car.id,
    //     availableStatuses: [
    //       FieldNames.CarStatus.customerService_OnDelete,
    //     ],
        // comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
    //   },
    //   header: 'Звонок клиенту',
    //   width: '70%',
    // });

    // this.subscribeOnCloseModalRef(ref);
  }

  onSearch(v: Event) {
    const inputTarget: HTMLInputElement = v.target as HTMLInputElement;
    this.sortCars(inputTarget.value)
  }

  onSelectEntity(cars: ServerCar.Response[]) {
    this.isSelectCarModalMode && this.onSelectCar.emit(cars);
  }
}
