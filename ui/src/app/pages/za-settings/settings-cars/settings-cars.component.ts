import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { SortEvent } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Subject, zip } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';
import { getCarStatus, ServerCar } from 'src/app/entities/car';
import { FieldsUtils, FieldType, ServerField, UIRealField } from 'src/app/entities/field';
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
import { CustomerServiceCallComponent } from '../modals/customer-service-call/customer-service-call.component';
import { TransformToCarShooting } from '../modals/transform-to-car-shooting/transform-to-car-shooting.component';
import { UploadCarMediaComponent } from '../modals/upload-car-media/upload-car-media.component';
import { GridActionConfigItem, GridConfigItem } from '../shared/grid/grid.component';
import { settingsCarsStrings } from './settings-cars.strings';

type UIFilter = {
  title: string;
  name: string;
} & (
  {
    type: FieldType.Text;
    value: string;
    defaultValue: string;
  } | {
    type: FieldType.Dropdown;
    value: string;
    defaultValue: string;
    variants?: { label: string | 'Все', value: string | 'Все' }[]
  } | {
    type: FieldType.Number;
    values: [number, number],
    defaultValues: [number, number];
    max: number;
    min: number;
    step: number;
  }
)

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
  FieldTypes = FieldType;
  get addCarButtonAvailable() {
    return !this.isSelectCarModalMode && !this.sessionService.isCarSales && !this.sessionService.isCarSalesChief
  }

  sortedCars: ServerCar.Response[] = [];
  rawCars: ServerCar.Response[] = [];

  loading = false;

  searchText = '';

  @Input() type: QueryCarTypes | '' = '';

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

  availableStatuses: { label: FieldNames.CarStatus, value: FieldNames.CarStatus }[] = [];
  selectedStatus: (FieldNames.CarStatus)[] = [];

  readonly strings = settingsCarsStrings;

  destroyed = new Subject();

  filters: UIFilter[] = []
  selectedFilters: { name: string, value: string }[] = [];

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
        this.type = !this.isSelectCarModalMode
          ? this.route.snapshot.queryParamMap.get('type') as QueryCarTypes || ''
          : QueryCarTypes.carsForSale;

        this.setGridSettings();

        this.getCars().subscribe();
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

        this.generateFilters();
      });

    this.getCars().subscribe();

    this.setGridSettings();
  }

  getCars() {
    this.loading = true;
    return this.carService.getCars().pipe(
        tap((res => {
          this.loading = false;
          this.rawCars = [...res];
          this.generateFilters();
          this.sortCars();
        }))
      )
  }

  subscribeOnCloseModalRef(ref: DynamicDialogRef, force = false) {
    ref.onClose
      .subscribe(res => {
        if (res || force) {
          // this.carService.getCars().subscribe((result) => {
          //   this.rawCars = result;
          //   this.sortCars();
          // })
          this.getCars().subscribe();
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
      });
  }

  sortCars() {
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
          ...availableStatuses.map(s => ({ label: s, value: s }))
        ];
        this.sortedCars = this.rawCars
          .filter(c => `${FieldsUtils.getFieldValue(c, FieldNames.Car.contactCenterSpecialistId)}` === `${this.sessionService.userSubj.getValue()?.id}` && (
                        this.selectedStatus.includes(getCarStatus(c)) || this.selectedStatus.length === 0
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
        this.availableStatuses = [
          ...availableStatuses2.map(s => ({ label: s, value: s }))]

        this.sortedCars = this.rawCars // FIX THIS
          .filter(c => this.selectedStatus.includes(getCarStatus(c)) || this.selectedStatus.length === 0);
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

      return name.toLocaleLowerCase().indexOf(this.searchText.toLocaleLowerCase()) !== -1
    })

    this.selectedFilters.forEach(filter => {
      const value = JSON.parse(filter.value);
      const filterConfig = this.filters.find(f => f.name === filter.name);

      if (filterConfig?.type === FieldType.Dropdown && value !== 'Все') {
        this.sortedCars = this.sortedCars.filter(car => {
          const name = FieldsUtils.getFieldValue(car, filterConfig.name);

          return name === value;
        })
      }

      if (filterConfig?.type === FieldType.Text && value !== '') {
        this.sortedCars = this.sortedCars.filter(car => {
          const v = FieldsUtils.getFieldStringValue(car, filterConfig.name) || '';

          return v.toLocaleLowerCase().indexOf((value || '').toLocaleLowerCase()) !== -1
        })
      }

      if (filterConfig?.type === FieldType.Number && value !== '') {
        this.sortedCars = this.sortedCars.filter(car => {
          const v = FieldsUtils.getFieldNumberValue(car, filterConfig.name) || '';
          const values = value as [number, number]

          return v >= values[0] && v <= values[1];
        })
      }
    });
  }

  private getGridConfig(): GridConfigItem<ServerCar.Response>[] {
    const configs: GridConfigItem<ServerCar.Response>[] = [{
      title: this.strings.id,
      name: 'id',
      getValue: (item) => {
        const user = FieldsUtils.getFieldValue(item, FieldNames.Car.contactCenterSpecialist);


        const contactCenterSpecialist: ServerUser.Response = JSON.parse(user || '{}');
        const contactCenterSpecialistName = FieldsUtils.getFieldValue(contactCenterSpecialist, FieldNames.User.name);

        return `${item.id} ${(contactCenterSpecialistName || '').split(' ').map(word => word[0]).join('')}`;
      }, // TODO! ,
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
      title: this.strings.bodyType,
      name: 'body-type',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.bodyType),
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
      available: () => this.type !== QueryCarTypes.carsForSale && (this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief),
    }, {
      title: this.strings.shootingTime,
      name: 'shootingTime',
      getValue: (item) => moment(new Date(+(FieldsUtils.getFieldValue(item, FieldNames.Car.shootingDate) || 0))).format('HH:mm'),
      available: () => this.type !== QueryCarTypes.carsForSale && (this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief),
    }, {
      title: this.strings.dateOfLastCustomerCall,
      name: FieldNames.Car.dateOfLastCustomerCall,
      getValue: (item) => DateUtils.getFormatedDate(+(FieldsUtils.getFieldValue(item, FieldNames.Car.dateOfLastCustomerCall) || 0)),
      available: () => this.type === QueryCarTypes.carsForSale && (
        this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief
      ),
      sortable: () => true
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
      title: 'Редактировать',
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
      title: 'Удалить',
      icon: 'times',
      buttonClass: 'danger',
      available: () => (this.sessionService.isAdminOrHigher) && !this.isSelectCarModalMode,
      handler: (car) => this.deleteCar(car),
    }, {
      title: '[ОКЦ] Звонок',
      icon: 'mobile',
      buttonClass: 'secondary',
      available: () => (this.sessionService.isAdminOrHigher || this.sessionService.isContactCenter || this.sessionService.isContactCenterChief) && !this.isSelectCarModalMode,
      handler: (car) => this.contactCenterCall(car),
    }, {
      title: 'Передать в ОСА',
      icon: 'check',
      buttonClass: 'primary',
      available: () => (this.sessionService.isAdminOrHigher || this.sessionService.isContactCenterChief) && !this.isSelectCarModalMode,
      handler: (car) => this.transformToCarShooting(car),
    }, {
      title: 'Анкета',
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
      title: 'Медиа',
      icon: 'camera',
      buttonClass: 'secondary',
      available: () => (this.sessionService.isAdminOrHigher || this.sessionService.isCarShooting || this.sessionService.isCarShootingChief) && !this.isSelectCarModalMode,
      handler: (car) => this.uploadMedia(car),
    }, {
      title: 'Вернуть в ОКЦ',
      icon: 'caret-left',
      buttonClass: 'danger',
      available: () => (this.sessionService.isAdminOrHigher || this.sessionService.isCarShooting || this.sessionService.isCarShootingChief) && !this.isSelectCarModalMode,
      handler: (car) => this.returnToContactCenter(car),
    }, {
      title: 'Передать в ОРК',
      icon: 'caret-right',
      buttonClass: 'primary',
      available: () => (this.sessionService.isAdminOrHigher || this.sessionService.isCarShooting || this.sessionService.isCarShootingChief) && !this.isSelectCarModalMode,
      handler: (car) => this.transformToCustomerService(car),
    }, {
      title: 'Вернуть в ОСА',
      icon: 'caret-left',
      buttonClass: 'danger',
      available: () => this.type === QueryCarTypes.shootedBase && !this.isSelectCarModalMode && (
           this.sessionService.isAdminOrHigher
        || this.sessionService.isCustomerService
        || this.sessionService.isCustomerServiceChief),
      handler: (car) => this.returnToShootingCar(car),
    }, {
      title: 'Подтвердить правильность',
      icon: 'caret-right',
      buttonClass: 'primary',
      available: () => this.type === QueryCarTypes.shootedBase && !this.isSelectCarModalMode && (
          this.sessionService.isAdminOrHigher
       || this.sessionService.isCustomerService
       || this.sessionService.isCustomerServiceChief),
      handler: (car) => this.transformToCustomerServiceAprooved(car),
    }, {
      title: 'Поставить на паузу',
      icon: 'pause',
      buttonClass: 'primary',
      available: () => this.type === QueryCarTypes.carsForSale && !this.isSelectCarModalMode && (
          this.sessionService.isAdminOrHigher
       || this.sessionService.isCustomerService
       || this.sessionService.isCustomerServiceChief),
      handler: (car) => this.transformToCustomerServicePause(car),
    }, {
      title: 'Поставить на удаление',
      icon: 'times',
      buttonClass: 'danger',
      available: () => this.type === QueryCarTypes.carsForSale && !this.isSelectCarModalMode && (
          this.sessionService.isAdminOrHigher
       || this.sessionService.isCustomerService
       || this.sessionService.isCustomerServiceChief),
      handler: (car) => this.transformToCustomerServiceDelete(car),
    }, {
      title: '[ОРК] Звонок',
      icon: 'mobile',
      buttonClass: 'secondary',
      available: () => this.type === QueryCarTypes.carsForSale && !this.isSelectCarModalMode && (
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
    const ref = this.dialogService.open(CustomerServiceCallComponent, {
      data: {
        car: car,
      },
      header: 'Звонок клиенту',
      width: '95%',
    });

    this.subscribeOnCloseModalRef(ref, true);
  }

  onSearch(v: Event) {
    const inputTarget: HTMLInputElement = v.target as HTMLInputElement;

    this.searchText = inputTarget?.value || '';

    this.sortCars();
  }

  onSelectEntity(cars: ServerCar.Response[]) {
    this.isSelectCarModalMode && this.onSelectCar.emit(cars);
  }

  private generateFilters() {
    const transmissionField = this.carFieldConfigs.find(config => config.name === FieldNames.Car.transmission);
    const engineField = this.carFieldConfigs.find(config => config.name === FieldNames.Car.engine);
    const driveTypeField = this.carFieldConfigs.find(config => config.name === FieldNames.Car.driveType);

    if (!transmissionField || !engineField || !driveTypeField) {
      console.log('Поля не найдены в carFieldConfigs')
      return;
    }

    const createVariants = (field: ServerField.Response) => {
      return (new UIRealField(
        field,
        'd'
      )).variants.map(variant => ({ label: variant.value, value: variant.key }))
    }

    this.filters = [{
      title: this.strings.mileage,
      name: FieldNames.Car.mileage,
      type: FieldType.Number,
      values: [0, 300000],
      defaultValues: [0, 300000],
      max: 300000,
      min: 0,
      step: 10000,
    }, {
      title: this.strings.transmission,
      name: FieldNames.Car.transmission,
      type: FieldType.Dropdown,
      value: 'Все',
      defaultValue: 'Все',
      variants: [{
          label: 'Все', value: 'Все'
        },
        ...createVariants(transmissionField)
      ]
    }, {
      title: this.strings.color,
      name: FieldNames.Car.color,
      type: FieldType.Text,
      value: '',
      defaultValue: '',
    }, {
      title: this.strings.engineCapacity,
      name: FieldNames.Car.engineCapacity,
      type: FieldType.Number,
      values: [1.0, 5.0],
      defaultValues: [1.0, 5.0],
      max: 5.0,
      min: 1.0,
      step: 0.1,
    }, {
      title: this.strings.driveType,
      name: FieldNames.Car.driveType,
      type: FieldType.Dropdown,
      value: 'Все',
      defaultValue: 'Все',
      variants: [{
          label: 'Все', value: 'Все'
        },
        ...createVariants(driveTypeField)
      ]
    }, {
      title: this.strings.bodyType,
      name: FieldNames.Car.bodyType,
      type: FieldType.Text,
      value: '',
      defaultValue: '',
    }, {
      title: this.strings.year,
      name: FieldNames.Car.year,
      type: FieldType.Number,
      values: [1990, (new Date()).getFullYear()],
      defaultValues:  [1990, (new Date()).getFullYear()],
      max: (new Date()).getFullYear(),
      min: 1990,
      step: 1,
    }, {
      title: this.strings.engine,
      name: FieldNames.Car.engine,
      type: FieldType.Dropdown,
      value: 'Все',
      defaultValue: 'Все',
      variants: [{
          label: 'Все', value: 'Все'
        },
        ...createVariants(engineField)
      ]
    }, {
      title: this.strings.carOwnerPrice,
      name: FieldNames.Car.carOwnerPrice,
      type: FieldType.Number,
      values: [5000, 50000],
      defaultValues:  [5000, 50000],
      max: 50000,
      min: 5000,
      step: 500,
    } ];
  }

  changeFilter(filterConfig: UIFilter, e: { originalEvent: PointerEvent | Event, value: string }) {
    const index = this.selectedFilters.findIndex(filter => filter.name === filterConfig.name);

    if (filterConfig.type === this.FieldTypes.Number) {
      return;
    }

    if (index !== -1) {
      if (filterConfig.defaultValue === e.value) {
        this.selectedFilters.splice(index, 1);
      } else {
        this.selectedFilters[index].value = JSON.stringify(e.value);
      }
    } else if (filterConfig.defaultValue !== e.value) {
      this.selectedFilters.push({
        name: filterConfig.name,
        value: JSON.stringify(e.value),
      })
    }

    this.sortCars();
  }

  changeNumberRangeFilter(filterConfig: UIFilter, e: { values: [number, number] }) {
    const index = this.selectedFilters.findIndex(filter => filter.name === filterConfig.name);

    if (filterConfig.type !== this.FieldTypes.Number) {
      return;
    }

    let value = e.values;

    if (filterConfig?.type === this.FieldTypes.Number && value[1] === filterConfig.max) {
      value = [e.values[0], 99999999999]
    }

    if (filterConfig?.type === this.FieldTypes.Number && value[0] === filterConfig.min) {
      value = [-9999999, value[1]]
    }

    if (index !== -1) {
      if (filterConfig.defaultValues[0] === e.values[0] && filterConfig.defaultValues[1] === e.values[1]) {
        this.selectedFilters.splice(index, 1);
      } else {
        this.selectedFilters[index].value = JSON.stringify(value);
      }
    } else if (!(filterConfig.defaultValues[0] === e.values[0] && filterConfig.defaultValues[1] === e.values[1])) {
      this.selectedFilters.push({
        name: filterConfig.name,
        value: JSON.stringify(value),
      })
    }

    this.sortCars();
  }

  transformFormInputEvent(e: Event): { originalEvent: PointerEvent | Event, value: string } {
    const inputTarget: HTMLInputElement = e.target as HTMLInputElement;

    return {
      originalEvent: e,
      value: inputTarget.value
    }
  }
}
