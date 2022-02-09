import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as moment from 'moment';
import { SortEvent } from 'primeng/api';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { Observable, of, Subject, Subscription, zip } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';
import { ServerFile, getCarStatus, ICarForm, RealCarForm, ServerCar } from 'src/app/entities/car';
import { StringHash } from 'src/app/entities/constants';
import { FieldsUtils, FieldType, ServerField, UIRealField } from 'src/app/entities/field';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerRole } from 'src/app/entities/role';
import { ServerUser } from 'src/app/entities/user';
import { DateUtils } from 'src/app/entities/utils';
import { CarService } from 'src/app/services/car/car.service';
import { ClientService } from 'src/app/services/client/client.service';
import { SessionService } from 'src/app/services/session/session.service';
import { UserService } from 'src/app/services/user/user.service';
import { ChangeCarStatusComponent } from '../modals/change-car-status/change-car-status.component';
import { CreateCarFormComponent } from '../modals/create-car-form/create-car-form.component';
import { CreateCarComponent } from '../modals/create-car/create-car.component';
import { CreateClientComponent } from '../modals/create-client/create-client.component';
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
    variants: { label: string | 'Все', value: string | 'Все' }[]
  } | {
    type: FieldType.Number;
    values: [number, number],
    defaultValues: [number, number];
    max: number;
    min: number;
    step: number;
  } | {
    type: FieldType.Multiselect;
    value: string[];
    defaultValue: string[];
    variants: { label: string, value: string }[]
  }
)

function calculateBargain(price: number) {
  let bargain = 0;

  if (price < 10000) {
    bargain = 200;
  } else if (10000 <= price && price < 15000) {
    bargain = 300;
  } else if (15000 <= price && price < 20000) {
    bargain = 400;
  } else if (20000 <= price && price < 30000) {
    bargain = 500;
  } else if (30000 <= price && price < 40000) {
    bargain = 700;
  } else if (40000 <= price && price < 50000) {
    bargain = 1000;
  } else if (50000 <= price) {
    bargain = 1500;
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
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DialogService,
    CarService,
    UserService,
    ClientService
  ]
})
export class SettingsCarsComponent implements OnInit, OnDestroy {
  FieldTypes = FieldType;
  get addCarButtonAvailable() {
    return !this.isSelectCarModalMode && !this.sessionService.isCarSales && !this.sessionService.isCarSalesChief
  }
  get isCustomerService() {
    return this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief
  }
  allCarsNumber = 0;

  rangeDates: [Date, Date | null] | null = null;

  sortedCars: ServerCar.Response[] = [];
  rawCars: ServerCar.Response[] = [];

  loading = false;

  searchText = '';

  @Input() type: QueryCarTypes | '' = '';

  @Input() isSelectCarModalMode = false;
  @Input() selected: ServerCar.Response[] = [];
  @Input() carsToSelect: ServerCar.Response[] = [];
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

  getCarsSubs: Subscription | undefined;

  clientFieldConfigs: ServerField.Response[] = [];

  filters: UIFilter[] = []
  selectedFilters: { name: string, value: string }[] = [];

  selectedContactCenterUsers: string[] = []
  contactCenterUserOptions: { label: string, key: string }[] = [];
  get onSelectContactUserAvailable() {
    return this.sessionService.isContactCenterChief && this.type === QueryCarTypes.allCallBase;
  }

  get contactStatiscticModeAvailable() {
    return this.type === QueryCarTypes.allCallBase || this.type === QueryCarTypes.myCallBase;
  }
  isContactStatiscticMode = false;

  getColorConfig: ((item: ServerCar.Response) => string) | undefined
  getTooltipConfig: ((item: ServerCar.Response) => string) | undefined

  constructor(
    private carService: CarService,
    private dialogService: DialogService,
    private route: ActivatedRoute,
    private sessionService: SessionService,
    private userService: UserService,
    private clientService: ClientService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getTooltipConfig = (car) => {
      return `${FieldsUtils.getFieldValue(car, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(car, FieldNames.Car.model)}`
    }

    this.clientService.getClientFields().subscribe(result => {
      this.clientFieldConfigs = result;
    })

    this.selectedContactCenterUsers = [];

    switch (this.type) {
      case QueryCarTypes.myCallBase:
        this.selectedContactCenterUsers = [`${this.sessionService.userSubj.getValue()?.id || ''}`].filter(id => !!id);
        break;
    }

    this.type = !this.isSelectCarModalMode
      ? this.route.snapshot.queryParamMap.get('type') as QueryCarTypes || ''
      : QueryCarTypes.carsForSale;

    this.route.queryParams
      .pipe(
        takeUntil(this.destroyed)
      )
      .subscribe(params => {
        const oldType = this.type;

        this.type = !this.isSelectCarModalMode
          ? this.route.snapshot.queryParamMap.get('type') as QueryCarTypes || ''
          : QueryCarTypes.carsForSale;

        this.selectedContactCenterUsers = [];

        switch (this.type) {
          case QueryCarTypes.myCallBase:
            this.selectedContactCenterUsers = [`${this.sessionService.userSubj.getValue()?.id || ''}`].filter(id => !!id);
            break;
        }

        this.setGridSettings();

        if (oldType !== this.type) {
          this.getCars(true);
        }
      });

    this.sessionService.roleSubj
      .pipe(
        takeUntil(this.destroyed)
      )
      .subscribe(user => {
        this.type = !this.isSelectCarModalMode
          ? this.route.snapshot.queryParamMap.get('type') as QueryCarTypes || ''
          : QueryCarTypes.carsForSale;

        this.setGridSettings();

        // this.getCars(true).subscribe();
      });

    zip(this.carService.getCarFields(), this.carService.getCarOwnersFields(), this.userService.getUsers())
      .subscribe(([carFieldConfigs, carOwnerFieldConfigs, users]) => {
        this.carFieldConfigs = carFieldConfigs;
        this.carOwnerFieldConfigs = carOwnerFieldConfigs;
        this.contactCenterUsers = users
          .filter(u => u.customRoleName === ServerRole.Custom.contactCenter
                    || u.customRoleName === ServerRole.Custom.contactCenterChief
                    || (
                      (
                        u.roleLevel === ServerRole.System.Admin || u.roleLevel === ServerRole.System.SuperAdmin
                      )
                    ));
        this.carShootingUsers = users
          .filter(u => u.customRoleName === ServerRole.Custom.carShooting
                    || u.customRoleName === ServerRole.Custom.carShootingChief
                    || (
                      (
                        u.roleLevel === ServerRole.System.Admin || u.roleLevel === ServerRole.System.SuperAdmin
                      )
                    ));

        this.contactCenterUserOptions = this.contactCenterUsers.map(u => ({
          label: FieldsUtils.getFieldStringValue(u, FieldNames.User.name),
          key: `${u.id}`
        }))

        this.generateFilters();
      });

    this.getCars(true);

    this.setGridSettings();
  }

  subscribeOnCloseModalRef(car: ServerCar.Response | null, ref: DynamicDialogRef, force = false) {
    ref.onClose
      .subscribe(res => {
        if (res || force) {
          this.loading = true;

          const carId = car ? car.id : res.id;

          this.carService.getCar(carId)
            .subscribe(res => {
              this.loading = false;
              this.addRawCarToRawCars(res);
            });
        }
      })
  }

  addRawCarToRawCars(car: ServerCar.Response) {
    const existIndex = this.rawCars.findIndex(c => c.id === car.id);

    if (existIndex === -1) {
      this.rawCars.push(car);
    } else {
      this.rawCars[existIndex] = car;
    }

    this.generateFilters();
    this.sortCars();
  }

  getCars(first = false) {
    this.loading = true;
    this.getCarsSubs && this.getCarsSubs.unsubscribe();

    let getCarsObs = this.carService.getCars();

    if (this.selectedContactCenterUsers.length > 0) {
      const query: StringHash = {};
      query[FieldNames.Car.contactCenterSpecialistId] = this.selectedContactCenterUsers.join(',');
      getCarsObs = this.carService.getCarsByQuery(query)
    }

    this.getCarsSubs = (
      this.carsToSelect.length > 0
        ? of(this.carsToSelect)
        : getCarsObs
      ).pipe(
        tap((res => {
          this.loading = false;
          this.rawCars = [...res];
          this.generateFilters();
          this.sortCars(first);
        })),
        takeUntil(this.destroyed)
      ).subscribe();
  }

  setGridSettings() {
    this.gridConfig = this.getGridConfig();
    this.gridActionsConfig = this.getGridActionsConfig();


    if (this.type === QueryCarTypes.myCallBase || this.type === QueryCarTypes.allCallBase) {
      this.getColorConfig = (car) => {
        const status = getCarStatus(car)

        // FieldNames.CarStatus.contactCenter_WaitingShooting,
        // FieldNames.CarStatus.contactCenter_InProgress,
        // FieldNames.CarStatus.contactCenter_Deny,
        // FieldNames.CarStatus.contactCenter_MakingDecision,
        // FieldNames.CarStatus.contactCenter_NoAnswer,
        // FieldNames.CarStatus.contactCenter_Refund

        switch (status) {
          case FieldNames.CarStatus.contactCenter_WaitingShooting: return '#008000a3'
          case FieldNames.CarStatus.contactCenter_MakingDecision: return 'yellow'
          case FieldNames.CarStatus.contactCenter_NoAnswer: return 'orange'
          case FieldNames.CarStatus.contactCenter_Refund: return '#80008080'

          default: return '';
        }
      }
    }
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

    this.subscribeOnCloseModalRef(car, ref);
  }

  deleteCar(car: ServerCar.Response) {
    const ok = confirm(`Вы уверены что хотите удалить машину со статусом ${getCarStatus(car)}`);

    if (ok) {
      this.loading = true;

      this.carService.deleteCar(car.id)
        .subscribe(res => {
          this.loading = false;
          this.rawCars = this.rawCars.filter(c => c.id !== res.id);
          this.sortCars();
        });
    }
  }

  sortCars(first = false) {
    switch (this.type) {
      case QueryCarTypes.myCallBase:
        const availableStatuses = [
          FieldNames.CarStatus.contactCenter_WaitingShooting,
          FieldNames.CarStatus.contactCenter_InProgress,
          FieldNames.CarStatus.contactCenter_Deny,
          FieldNames.CarStatus.contactCenter_MakingDecision,
          FieldNames.CarStatus.contactCenter_NoAnswer,
          FieldNames.CarStatus.contactCenter_Refund
        ];
        this.availableStatuses = [
          ...availableStatuses.map(s => ({ label: s, value: s }))
        ];

        if (first) {
          this.selectedStatus = [
            FieldNames.CarStatus.contactCenter_WaitingShooting,
            FieldNames.CarStatus.contactCenter_InProgress,
            FieldNames.CarStatus.contactCenter_MakingDecision,
            FieldNames.CarStatus.contactCenter_NoAnswer,
            FieldNames.CarStatus.contactCenter_Refund,
          ]
        }

        this.sortedCars = this.rawCars
          .filter(c => {
            const readyStatuses = [
              FieldNames.CarStatus.carShooting_InProgres,
              FieldNames.CarStatus.carShooting_Refund,
              FieldNames.CarStatus.carShooting_Ready,
              FieldNames.CarStatus.customerService_InProgress,
              FieldNames.CarStatus.customerService_OnPause,
              FieldNames.CarStatus.customerService_OnDelete,
              FieldNames.CarStatus.customerService_Sold,
              FieldNames.CarStatus.carSales_Deposit,
              FieldNames.CarStatus.admin_Deleted
            ]

            const isStatus = this.contactStatiscticModeAvailable && this.isContactStatiscticMode
              ? readyStatuses.includes(getCarStatus(c))
              : (
                this.selectedStatus.includes(getCarStatus(c)) || this.selectedStatus.length === 0
              ) && availableStatuses.includes(getCarStatus(c))

            return `${FieldsUtils.getFieldValue(c, FieldNames.Car.contactCenterSpecialistId)}` === `${this.sessionService.userSubj.getValue()?.id}` && isStatus
          });
        break;
      case QueryCarTypes.allCallBase:
        const availableStatuses2 = [
          FieldNames.CarStatus.contactCenter_WaitingShooting,
          FieldNames.CarStatus.contactCenter_InProgress,
          FieldNames.CarStatus.contactCenter_Deny,
          FieldNames.CarStatus.contactCenter_MakingDecision,
          FieldNames.CarStatus.contactCenter_NoAnswer,
          FieldNames.CarStatus.contactCenter_Refund
        ];
        this.availableStatuses = [
          ...availableStatuses2.map(s => ({ label: s, value: s }))
        ]

        if (first) {
          this.selectedStatus = [
            FieldNames.CarStatus.contactCenter_WaitingShooting,
            FieldNames.CarStatus.contactCenter_Refund
          ]
        }

        this.sortedCars = this.rawCars // FIX THIS
          .filter(c => {
            const readyStatuses = [
              FieldNames.CarStatus.customerService_InProgress,
              FieldNames.CarStatus.customerService_OnPause,
              FieldNames.CarStatus.customerService_OnDelete,
              FieldNames.CarStatus.customerService_Sold,
              FieldNames.CarStatus.carSales_Deposit,
              FieldNames.CarStatus.admin_Deleted
            ];

            const isStatus = this.contactStatiscticModeAvailable && this.isContactStatiscticMode
              ? readyStatuses.includes(getCarStatus(c))
              : (this.selectedStatus.includes(getCarStatus(c)) || this.selectedStatus.length === 0) && (
                availableStatuses2.includes(getCarStatus(c))
              )

            return isStatus;
          });

        if (this.selectedContactCenterUsers.length > 0) {
          this.sortedCars = this.sortedCars.filter(c => {
            const contactUserId = FieldsUtils.getFieldStringValue(c, FieldNames.Car.contactCenterSpecialistId);

            return this.selectedContactCenterUsers.includes(contactUserId);
          })
        }
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
                    // || getCarStatus(c) === FieldNames.CarStatus.carShooting_Ready
          );
        break;
      case QueryCarTypes.carsForSale:
        const availableStatuses3 = [
          FieldNames.CarStatus.customerService_InProgress,
          FieldNames.CarStatus.customerService_OnPause,
          FieldNames.CarStatus.customerService_OnDelete,
          FieldNames.CarStatus.customerService_Sold,
        ];

        this.allCarsNumber = this.sortedCars
          .filter(c => [
              FieldNames.CarStatus.customerService_InProgress,
              FieldNames.CarStatus.customerService_OnPause
            ].includes(getCarStatus(c))
          ).length;

        this.availableStatuses = [
          ...availableStatuses3.map(s => ({ label: s, value: s }))
        ];

        if (first) {
          this.selectedStatus = [
            FieldNames.CarStatus.customerService_InProgress,
            FieldNames.CarStatus.customerService_OnPause,
          ]
        }

        this.sortedCars = this.rawCars
          .filter(c => (availableStatuses3.includes(getCarStatus(c))) && (
            this.selectedStatus.includes(getCarStatus(c)) || this.selectedStatus.length === 0
          )
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
        this.sortedCars = [...this.rawCars];
    }

    this.sortedCars = this.sortedCars.filter(c => {
      if (this.rangeDates) {
        const dateFrom = +this.rangeDates[0];
        const dateTo = this.rangeDates[1] && (+this.rangeDates[1] + 1000 * 60 * 60 * 24);
        const carDate = +c.createdDate;

        return dateFrom < carDate && (!dateTo || dateTo > carDate);
      }

      return true;
    })

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

      if (filterConfig?.type === FieldType.Multiselect && value.length !== 0) {
        this.sortedCars = this.sortedCars.filter(car => {
          const fieldValue = FieldsUtils.getFieldValue(car, filterConfig.name);

          return value.includes(fieldValue);
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

    // this.sortedCars = [...this.sortedCars];
    this.cd.markForCheck();
  }

  private getGridConfig(): GridConfigItem<ServerCar.Response>[] {
    const configs: GridConfigItem<ServerCar.Response>[] = [{
      title: this.strings.id,
      name: 'id',
      getValue: (item) => {
        const user = FieldsUtils.getFieldValue(item, FieldNames.Car.contactCenterSpecialist);
        if (user) {
          const contactCenterSpecialist: ServerUser.Response = JSON.parse(user || '{}');
          const contactCenterSpecialistName = FieldsUtils.getFieldValue(contactCenterSpecialist, FieldNames.User.name);

          return `${item.id} ${(contactCenterSpecialistName || '').split(' ').map(word => word[0]).join('')}`;
        } else {
          return item.id
        }
      }, // TODO! ,
    }, this.type !== QueryCarTypes.carsForSale
      ? {
        title: this.strings.date,
        name: 'CreatedDate',
        getValue: (item) => {
          if (this.contactStatiscticModeAvailable && this.isContactStatiscticMode) {
            return DateUtils.getFormatedDate(+(FieldsUtils.getFieldValue(item, FieldNames.Car.shootingDate) || 0));
          }

          try {
            const firstStatusChange = FieldsUtils.getFieldStringValue(item, FieldNames.Car.dateOfFirstStatusChange)

            const date = new Date((+(firstStatusChange || '') || +item.createdDate));
            return date instanceof Date ? DateUtils.getFormatedDate(+date) : ''
          } catch (error) {
            console.error(error);
            return item.createdDate
          }
        },
        available: () => !(this.sessionService.isCarSales || this.sessionService.isCarSalesChief),
        isDate: true,
        sortable: () => true
      } : {
        title: this.strings.shootingDate,
        name: FieldNames.Car.shootingDate,
        getValue: (item) => DateUtils.getFormatedDate(+(FieldsUtils.getFieldValue(item, FieldNames.Car.shootingDate) || 0)),
        available: () => true, // this.type !== QueryCarTypes.carsForSale && (this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief),
        isDate: true,
        sortable: () => true
      },
    // {
    //   title: 'Ист',
    //   name: 'source',
    //   getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.source),
    //   available: () => !(this.sessionService.isCarSales || this.sessionService.isCarSalesChief),
    // },
    {
      title: this.strings.ownerName,
      name: 'ownerName',
      getValue: (item) => FieldsUtils.getFieldStringValue(item, FieldNames.CarOwner.name),
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
      sortable: () => true,
    }, {
      title: this.strings.year,
      name: 'year',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.year),
    }, {
      title: this.strings.worksheet,
      name: 'worksheet',
      getValue: (item) => {
        let worksheet: ICarForm | null;
        try {
          const worksheetSource = FieldsUtils.getFieldStringValue(item, FieldNames.Car.worksheet) || '';
          worksheet = JSON.parse(worksheetSource)
        } catch (error) {
          worksheet = null;
        }

        const form = new RealCarForm(worksheet);

        return form.getValidation() ? 'Есть' : 'Нет'
      },
      available: () => this.sessionService.isCarSales || this.sessionService.isCarSalesChief || this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief
    }, {
      title: this.strings.engine,
      name: 'engine',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.engine),
      available: () => !(this.sessionService.isContactCenter || this.sessionService.isContactCenterChief)
    }, {
      title: 'О-м',
      name: 'engineCapacity',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.engineCapacity),
      available: () => !(this.sessionService.isContactCenter || this.sessionService.isContactCenterChief)
    }, {
      title: this.strings.transmission,
      name: 'transmission',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.transmission),
      available: () => !(this.sessionService.isContactCenter || this.sessionService.isContactCenterChief)
    }, {
      title: this.strings.bodyType,
      name: 'body-type',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.bodyType),
      available: () => !(this.sessionService.isContactCenter || this.sessionService.isContactCenterChief)
    }, {
      title: this.strings.color,
      name: 'color',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.color),
      available: () => !(this.sessionService.isContactCenter || this.sessionService.isContactCenterChief)
    }, {
      title: this.strings.driveType,
      name: 'driveType',
      getValue: (item) => FieldsUtils.getDropdownValue(item, FieldNames.Car.driveType),
      available: () => !(this.sessionService.isContactCenter || this.sessionService.isContactCenterChief)
    }, {
      title: this.strings.mileage,
      name: 'mileage',
      getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.mileage),
      available: () => !(this.sessionService.isContactCenter || this.sessionService.isContactCenterChief)
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
      title: 'Комис',
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
                    || this.sessionService.isCarSales || this.sessionService.isCarSalesChief
                    || this.sessionService.isContactCenter || this.sessionService.isContactCenterChief,
    }, {
      title: this.strings.adPrice,
      name: FieldNames.Car.carOwnerPrice,
      getValue: (item) => {
        const price = +(FieldsUtils.getFieldValue(item, FieldNames.Car.carOwnerPrice) || 0);

        return `${calculateComission(price) + calculateBargain(price) + price}$`;
      },
      available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief
                    || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief
                    || this.sessionService.isCarSales || this.sessionService.isCarSalesChief,
      sortable: () => true
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
      name: FieldNames.Car.shootingDate,
      getValue: (item) => DateUtils.getFormatedDate(+(FieldsUtils.getFieldValue(item, FieldNames.Car.shootingDate) || 0)),
      available: () => this.type !== QueryCarTypes.carsForSale && (this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief),
      isDate: true,
      sortable: () => true
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
      isDate: true,
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
      getValue: (item) => (FieldsUtils.getFieldValue(item, FieldNames.Car.ourLinks) || '')?.split(',').filter(l => l).length,
      available: () => this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief,
    },
    // {
    //   title: this.strings.nextAction,
    //   name: 'nextAction',
    //   getValue: (item) => '', // TODO! specific field???
    //   available: () => this.sessionService.isContactCenter || this.sessionService.isContactCenterChief,
    // },
      {
        title: this.strings.dateOfNextAction,
        name: 'dateOfNextAction',
        getValue: (item) => FieldsUtils.getFieldValue(item, FieldNames.Car.dateOfNextAction),
        available: () => this.sessionService.isContactCenter || this.sessionService.isContactCenterChief,
      }
    ];

    return configs.filter(config => !config.available || config.available());
  }

  copyPhonesToClipboard() {
    const text = `${
      this.sortedCars.map(c => c.ownerNumber).join(`\n`)
    }`;

    if (typeof (navigator.clipboard) == 'undefined') {
      console.log('navigator.clipboard');
      var textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position="fixed";  //avoid scrolling to bottom
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
          var successful = document.execCommand('copy');
          var msg = successful ? 'successful' : 'unsuccessful';
          console.log(msg);
      } catch (err) {
          console.log('Was not possible to copy te text: ', err);
      }

      document.body.removeChild(textArea)
      return;
    }
    navigator.clipboard && navigator.clipboard.writeText(text).then(function() {
      console.log(`successful!`);
    }, function(err) {
      console.log('unsuccessful!', err);
    });
  }

  private getGridActionsConfig(): GridActionConfigItem<ServerCar.Response>[] {
    const configs: GridActionConfigItem<ServerCar.Response>[] = [{
      title: 'Копировать телефоны',
      icon: 'save',
      buttonClass: 'secondary',
      disabled: () => false,
      available: () => this.sessionService.isContactCenter
                    || this.sessionService.isContactCenterChief,
      handler: (car) => this.copyPhonesToClipboard()
    },{
      title: 'Редактировать',
      icon: 'pencil',
      buttonClass: 'secondary',
      disabled: () => false,
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
      title: 'Создать клиента',
      icon: 'pi pi-fw pi-mobile',
      buttonClass: 'secondary',
      handler: (car) => {
        const ref = this.dialogService.open(CreateClientComponent, {
          data: {
            predefinedCar: car,
            fieldConfigs: this.clientFieldConfigs,
          },
          header: 'Новый клиент',
          width: '70%',
        });
      },
      available: () => this.sessionService.isCarSales || this.sessionService.isCarSalesChief,
    }, {
      title: 'Медиа',
      icon: 'camera',
      buttonClass: 'secondary',
      available: () => !(this.sessionService.isContactCenter || this.sessionService.isContactCenterChief),
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
      title: 'Опубликовать машину',
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
      disabled: (car) => car ? getCarStatus(car) === FieldNames.CarStatus.customerService_OnPause : true,
      handler: (car) => this.transformToCustomerServicePause(car),
    }, {
      title: 'Снять с паузы',
      icon: 'pause',
      buttonClass: 'primary',
      available: () => this.type === QueryCarTypes.carsForSale && !this.isSelectCarModalMode && (
          this.sessionService.isAdminOrHigher
       || this.sessionService.isCustomerService
       || this.sessionService.isCustomerServiceChief),
      disabled: (car) => !car || !(getCarStatus(car) === FieldNames.CarStatus.customerService_OnPause),
      handler: (car) => this.transformToCustomerServicePause(car, true),
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

    this.subscribeOnCloseModalRef(null, ref);
  }

  contactCenterCall(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.contactCenter_MakingDecision,
          FieldNames.CarStatus.contactCenter_NoAnswer,
          FieldNames.CarStatus.contactCenter_Deny,
          FieldNames.CarStatus.contactCenter_WaitingShooting,
          FieldNames.CarStatus.contactCenter_InProgress
        ],
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
        isNextActionDateAvailable: true,
        dateOfNextAction: FieldsUtils.getFieldValue(car, FieldNames.Car.dateOfNextAction),
        dateOfFirstStatusChangeAvailable: true,
        dateOfFirstStatusChange: FieldsUtils.getFieldStringValue(car, FieldNames.Car.dateOfFirstStatusChange)
      },
      header: 'Звонок',
      width: '70%'
    });

    this.subscribeOnCloseModalRef(car, ref);
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

    this.subscribeOnCloseModalRef(car, ref);
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

    this.subscribeOnCloseModalRef(car, ref);
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

    this.subscribeOnCloseModalRef(car, ref);
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

    this.subscribeOnCloseModalRef(car, ref);
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

    this.subscribeOnCloseModalRef(car, ref);
  }

  transformToCustomerService(car: ServerCar.Response) {
    this.loading = true;

    this.validatePublish(car).subscribe(res => {
      if (res) {
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

        this.subscribeOnCloseModalRef(car, ref);
      }
    }, err => {
      alert('Произошла ошибка, запомните шаги которые привели к такой ситуации, сообщите администарутору.')
      console.error(err);
    }, () => {
      this.loading = false;
    });
  }

  transformToCustomerServiceAprooved(car: ServerCar.Response) {
    this.loading = true;

    this.validatePublish(car).subscribe(res => {
      if (res) {
        const ref = this.dialogService.open(ChangeCarStatusComponent, {
          data: {
            carId: car.id,
            availableStatuses: [
              FieldNames.CarStatus.customerService_InProgress,
            ],
            comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
          },
          header: 'Опубликовать',
          width: '70%',
        });

        this.subscribeOnCloseModalRef(car, ref);
      }
    }, err => {
      alert('Произошла ошибка, запомните шаги которые привели к такой ситуации, сообщите администарутору.')
      console.error(err);
    }, () => {
      this.loading = false;
    });
  }

  transformToCustomerServicePause(car: ServerCar.Response, isReverse = false) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          isReverse
            ? FieldNames.CarStatus.customerService_InProgress
            : FieldNames.CarStatus.customerService_OnPause,
        ],
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: isReverse
                ? 'Снять с паузы'
                : 'Поставить на паузу',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(car, ref);
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

    this.subscribeOnCloseModalRef(car, ref);
  }

  сustomerServiceCall(car: ServerCar.Response) {
    const ref = this.dialogService.open(CustomerServiceCallComponent, {
      data: {
        car: car,
      },
      header: 'Звонок клиенту',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(car, ref, true);
  }

  onSearch(v: Event) {
    const inputTarget: HTMLInputElement = v.target as HTMLInputElement;

    this.searchText = inputTarget?.value || '';

    this.sortCars();
  }

  onSelectEntity(cars: ServerCar.Response[]) {
    console.log(cars);
    this.isSelectCarModalMode && this.onSelectCar.emit(cars);
  }

  private generateFilters() {
    const transmissionField = this.carFieldConfigs.find(config => config.name === FieldNames.Car.transmission);
    const engineField = this.carFieldConfigs.find(config => config.name === FieldNames.Car.engine);
    const driveTypeField = this.carFieldConfigs.find(config => config.name === FieldNames.Car.driveType);
    const bodyTypeField = this.carFieldConfigs.find(config => config.name === FieldNames.Car.bodyType);

    if (!transmissionField || !engineField || !driveTypeField || !bodyTypeField) {
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
      type: FieldType.Multiselect,
      value: [],
      defaultValue: [],
      variants: [
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
      type: FieldType.Multiselect,
      value: [],
      defaultValue: [],
      variants: [
        ...createVariants(driveTypeField)
      ]
    }, {
      title: this.strings.bodyType,
      name: FieldNames.Car.bodyType,
      type: FieldType.Multiselect,
      value: [],
      defaultValue: [],
      variants: [
        ...createVariants(bodyTypeField)
      ]
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
      type: FieldType.Multiselect,
      value: [],
      defaultValue: [],
      variants: [
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

  changeMultiselectFilter(filterConfig: UIFilter, e: { originalEvent: PointerEvent | Event, value: string[], itemValue: string }) {
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

  private validatePublish(car: ServerCar.Response): Observable<boolean> {
    if (!FieldsUtils.getFieldValue(car, FieldNames.Car.worksheet)) {
      alert('У авто нету анкеты!');
      return of(false);
    }

    let worksheet: ICarForm | null;
    try {
      const worksheetSource = FieldsUtils.getFieldStringValue(car, FieldNames.Car.worksheet) || '';
      worksheet = JSON.parse(worksheetSource)
    } catch (error) {
      worksheet = null;
    }

    console.log(worksheet);

    const form = new RealCarForm(worksheet);

    if (!form.getValidation()) {
      alert('Анкета не заполнена!');
      return of(false);
    }

    return this.carService.getCarsImages(car.id)
      .pipe(
        map(images => {
          const carImages = images.filter(image => image.type === ServerFile.Types.Image);
          const image360 = images.find(image => image.type === ServerFile.Types.Image360);
          const stateImages = images.filter(image => image.type === ServerFile.Types.StateImage)

          if (!carImages.length || !image360 || !stateImages.length) {
            !carImages.length && alert('У машины нету фотографий.');
            !image360 && alert('У машины нету фото 360.');
            !stateImages.length && alert('У машины нету фотографий техпаспорта.');
            return false
          }

          return true;
        })
      );
  }
}
