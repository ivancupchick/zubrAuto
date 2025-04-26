import {
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SpinnerComponent } from 'src/app/shared/components/spinner/spinner.component';
import { PageagleGridComponent } from '../../shared/pageagle-grid/pageagle-grid.component';
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import {
  finalize,
  map,
  mergeMap,
  Observable,
  of,
  Subject,
  take,
  takeUntil,
  tap,
  zip,
} from 'rxjs';
import { CommonModule } from '@angular/common';
import { GridActionConfigItem, GridConfigItem } from '../../shared/grid/grid';
import { CarsBaseDataService } from './services/cars-base-data.service';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ServerUser } from 'src/app/entities/user';
import {
  getCarStatus,
  ICarForm,
  RealCarForm,
  ServerCar,
  ServerFile,
} from 'src/app/entities/car';
import {
  FormsModule,
  ReactiveFormsModule,
  UntypedFormBuilder,
  UntypedFormGroup,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  FieldDomains,
  FieldsUtils,
  FieldType,
  ServerField,
  UIRealField,
} from 'src/app/entities/field';
import { RequestService } from 'src/app/services/request/request.service';
import { SessionService } from 'src/app/services/session/session.service';
import { QueryCarTypes } from './cars.enums';
import {
  CarBaseFilterFormsInitialState,
  MultiselectUIFilter,
  NumberUIFilter,
  settingsCarsStrings,
  TextUIFilter,
  UIFilter,
} from './cars-base.strings';
import { DateUtils } from 'src/app/shared/utils/date.util';
import * as moment from 'moment';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { CreateCarComponent } from '../../modals/create-car/create-car.component';
import { ChangeCarStatusComponent } from '../../modals/change-car-status/change-car-status.component';
import { ChangeCarOwnerNumberComponent } from '../../modals/change-car-owner-number/change-car-owner-number.component';
import { TransformToCarShooting } from '../../modals/transform-to-car-shooting/transform-to-car-shooting.component';
import { CreateCarFormComponent } from '../../modals/create-car-form/create-car-form.component';
import { CreateClientComponent } from '../../modals/create-client/create-client.component';
import { FieldService } from 'src/app/services/field/field.service';
import { UploadCarMediaComponent } from '../../modals/upload-car-media/upload-car-media.component';
import { CustomerServiceCallComponent } from '../../modals/customer-service-call/customer-service-call.component';
import { ActivatedRoute } from '@angular/router';
import {
  StatusesByAdmin,
  StatusesByAllCallBase,
  StatusesByCarsForSale,
  StatusesByMyCallBase,
  StatusesByMyCallBaseReady,
  StatusesByMyShootingBase,
  StatusesByShootedBase,
  StatusesCarsForSaleTemp,
} from './cars-field-names.enum';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SliderModule } from 'primeng/slider';
import { UserService } from 'src/app/services/user/user.service';
import { ServerRole } from 'src/app/entities/role';
import { CarService } from 'src/app/services/car/car.service';

@Component({
  selector: 'za-cars-base',
  templateUrl: './cars-base.component.html',
  standalone: true,
  styleUrls: ['./cars-base.component.scss'],
  imports: [
    SpinnerComponent,
    PageagleGridComponent,
    ToolbarModule,
    ButtonModule,
    CommonModule,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    CalendarModule,
    MultiSelectModule,
    OverlayPanelModule,
    SliderModule,
  ],
})
export class CarsBaseComponent implements OnInit, OnDestroy {
  first: number = 0;
  dealStatuses: { name: string; value: string }[] = Object.values(
    FieldNames.DealStatus,
  ).map((s) => ({ name: s, value: s }));
  clientStatuses: { name: string; value: string }[] = Object.values(
    FieldNames.ClientStatus,
  ).map((s) => ({ name: s, value: s }));
  sourceList: { name: string; value: string }[] = Object.values(
    FieldNames.ClientSource,
  ).map((s) => ({ name: s, value: s }));
  specialistList: { name: string; value: string }[] = [];
  specialists: ServerUser.Response[] = [];
  allUsers: ServerUser.Response[] = [];
  allCars: ServerCar.Response[] = [];
  fieldConfigs: ServerField.Response[] = [];
  form!: UntypedFormGroup;
  gridConfig!: GridConfigItem<ServerCar.Response>[];
  gridActionsConfig: GridActionConfigItem<ServerCar.Response>[] = [];

  // новое
  loading = this.carsBaseDataService.loading;
  availableCarStatuses: {
    label: FieldNames.CarStatus;
    value: FieldNames.CarStatus;
  }[] = [];
  readonly strings = settingsCarsStrings;
  carFieldConfigs: ServerField.Response[] = [];
  carOwnerFieldConfigs: ServerField.Response[] = [];
  contactCenterUsers: ServerUser.Response[] = [];
  carShootingUsers: ServerUser.Response[] = [];
  clientFieldConfigs: ServerField.Response[] = [];
  contactCenterUserOptions: { label: string; key: string }[] = []; // не перезасечены
  selectedContactCenterUsers: string[] = []; // не перезасечены
  sortedCars: ServerCar.Response[] = []; // не перезасечены
  selectedCars: ServerCar.Response[] = []; // не перезасечены
  filters: UIFilter[] = [];
  FieldTypes = FieldType;
  selectedFilters: { [name: string]: { [serverField: string]: any } } = {};
  // selectedStatus: FieldNames.CarStatus[] = [];
  rangeDates: [Date, Date | null] | null = null;

  // инпуты вынести в отдельную логику
  @Input() type: QueryCarTypes | '' = '';
  @Input() isSelectCarModalMode = false;
  @Input() selected: ServerCar.Response[] = []; // не перезасечены

  getColorConfig: ((item: ServerCar.Response) => string) | undefined;

  list = this.carsBaseDataService.list;
  destroyed = new Subject();

  FieldNames = FieldNames;

  get onSelectContactUserAvailable() {
    return (
      this.sessionService.isContactCenterChief &&
      (this.type === QueryCarTypes.allCallBase ||
        this.type === QueryCarTypes.allCallBaseReady)
    );
  }

  get selectedFiltersLabel(): string {
    const length = Object.values(this.selectedFilters).length;
    return length > 0 ? length + ' фильтров выбрано' : 'Фильтры';
  }

  constructor(
    public carsBaseDataService: CarsBaseDataService,
    public fb: UntypedFormBuilder,
    private sessionService: SessionService,
    private dialogService: DialogService,
    private fieldService: FieldService,
    private route: ActivatedRoute,
    private cd: ChangeDetectorRef,
    private userService: UserService,
    private carService: CarService,
  ) {}

  ngOnInit(): void {
    this.type = !this.isSelectCarModalMode
      ? (this.route.snapshot.queryParamMap.get('type') as QueryCarTypes) || ''
      : QueryCarTypes.carsForSaleTemp;

    console.log(this.type);
    this.setAvailableStatuses();

    this.setGridSettings();
    this.form = this.fb.group(CarBaseFilterFormsInitialState);

    // функции внутри кода ниже пересечивают, точнее могут пересетить, значение формконтроллов
    this.route.queryParams
      .pipe(takeUntil(this.destroyed))
      .subscribe((params) => {
        const oldType = this.type;

        this.type = !this.isSelectCarModalMode
          ? (this.route.snapshot.queryParamMap.get('type') as QueryCarTypes) ||
            ''
          : QueryCarTypes.carsForSaleTemp;

        this.setContactCenterUsers();
        this.setGridSettings();

        if (oldType !== this.type) {
          this.initCars();
          this.carsBaseDataService.list.set({
            list: [],
            total: 0,
          });
        }
      });

    this.sessionService.roleSubj
      .pipe(takeUntil(this.destroyed))
      .subscribe((user) => {
        this.type = !this.isSelectCarModalMode
          ? (this.route.snapshot.queryParamMap.get('type') as QueryCarTypes) ||
            ''
          : QueryCarTypes.carsForSaleTemp;

        this.setGridSettings();
      });
    zip(
      this.carsBaseDataService.getCarFields(),
      this.carsBaseDataService.getCarOwnersFields(),
      this.userService.getUsers(true),
    ).subscribe(([carFieldConfigs, carOwnerFieldConfigs, users]) => {
      this.carFieldConfigs = carFieldConfigs;
      this.carOwnerFieldConfigs = carOwnerFieldConfigs;
      this.contactCenterUsers = users.list.filter(
        (u) =>
          u.customRoleName === ServerRole.Custom.contactCenter ||
          u.customRoleName === ServerRole.Custom.contactCenterChief ||
          u.roleLevel === ServerRole.System.Admin ||
          u.roleLevel === ServerRole.System.SuperAdmin,
      );
      this.carShootingUsers = users.list.filter(
        (u) =>
          u.customRoleName === ServerRole.Custom.carShooting ||
          u.customRoleName === ServerRole.Custom.carShootingChief ||
          u.roleLevel === ServerRole.System.Admin ||
          u.roleLevel === ServerRole.System.SuperAdmin,
      );

      this.contactCenterUserOptions = this.contactCenterUsers.map((u) => ({
        label: FieldsUtils.getFieldStringValue(u, FieldNames.User.name),
        key: `${u.id}`,
      }));

      this.generateFilters();
    });

    this.setGridSettings();
    this.initCars();
  }
  getclientFieldConfigs() {
    // тут  надо вернуть обычное значение this.clientFieldConfigs уже засетченое, чутка не шарю
    return this.fieldService
      .getFieldsByDomain(FieldDomains.Client)
      .pipe(take(1))
      .subscribe((res) => (this.clientFieldConfigs = res));
  }
  // доделать закоменченое
  initCars() {
    // this.resetState();
    this.setAvailableStatuses();
    this.setDefaultStatuses();
    // this.getCars();
  }

  filter(isChangePage = true) {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    let filters = skipEmptyFilters({ ...structuredClone(this.form.value) });
    if (filters.mark) {
      const { mark, ...rest } = filters;
      filters = { mark: mark, 'filter-operator-mark': 'LIKE', ...rest };
    }
    if (filters.status?.length) {
      const { status, ...rest } = filters;
      if (status.length !== Object.keys(FieldNames.CarStatus).length) {
        filters = { status: status, ...rest };
      } else {
        filters = rest;
      }
    } else {
      if (this.availableCarStatuses.length > 0) {
        filters[FieldNames.Car.status] = this.availableCarStatuses.map(
          (s) => s.value,
        );
      }
    }
    if (filters.number) {
      const { number, ...rest } = filters;
      filters = {
        number: `%${number.replaceAll('+', '')}%`,
        'filter-operator-number': 'LIKE',
        ...rest,
      };
    }
    if (filters.date) {
      const { date, ...rest } = filters;
      if (date[1] !== null) {
        filters = {
          createdDate: `${Date.parse(String(date[0]).replace('00:00:00', '00:00:01'))}-${Date.parse(String(date[1]).replace('00:00:00', '23:59:59'))}`,
          'filter-operator-createdDate': 'range',
          ...rest,
        };
      } else {
        filters = {
          createdDate: Date.parse(
            String(date[0]).replace('00:00:00', '00:00:01'),
          ),
          'filter-operator-createdDate': '>',
          ...rest,
        };
      }
    }
    Object.values(this.selectedFilters).forEach((specialFilter) => {
      filters = { ...specialFilter, ...filters };
    });

    if (isChangePage) {
      this.first = 1; // TODO refactor it
      this.cd.detectChanges();
      this.first = 0;
    }

    const payload = { ...filters };
    if (isChangePage) {
      payload.page = 1;
    }

    this.carsBaseDataService.updateFiltersAndFetch(payload);
  }

  clearFilters() {
    this.form.reset(CarBaseFilterFormsInitialState);
    const filters = skipEmptyFilters({ ...this.form.value });
    this.selectedFilters = {};

    this.first = 1; // TODO refactor it
    this.cd.detectChanges();
    this.first = 0;
    this.carsBaseDataService.updateFiltersAndFetch({ page: 1, ...filters });
  }

  openNewCarWindow() {}

  getAllSelectedCars(): number {
    return this.selectedCars.length !== 0
      ? this.selectedCars.length
      : this.selected.length;
  }

  setContactCenterUsers() {
    switch (this.type) {
      case QueryCarTypes.myCallBaseReady:
      case QueryCarTypes.myCallBase:
        this.selectedContactCenterUsers = [
          `${this.sessionService.userSubj.getValue()?.id || ''}`,
        ].filter((id) => !!id);
        break;
    }
  }

  setAvailableStatuses() {
    switch (this.type) {
      case QueryCarTypes.byAdmin:
        this.availableCarStatuses = [
          ...StatusesByAdmin.map((s) => ({ label: s, value: s })),
        ];
        break;
      case QueryCarTypes.myCallBaseReady:
      case QueryCarTypes.allCallBaseReady:
        this.availableCarStatuses = [
          ...StatusesByMyCallBaseReady.map((s) => ({ label: s, value: s })),
        ];
        break;
      case QueryCarTypes.myCallBase:
        this.availableCarStatuses = [
          ...StatusesByMyCallBase.map((s) => ({ label: s, value: s })),
        ];
        break;
      case QueryCarTypes.allCallBase:
        this.availableCarStatuses = [
          ...StatusesByAllCallBase.map((s) => ({ label: s, value: s })),
        ];
        break;
      case QueryCarTypes.myShootingBase:
      case QueryCarTypes.allShootingBase:
        this.availableCarStatuses = [
          ...StatusesByMyShootingBase.map((s) => ({ label: s, value: s })),
        ];
        break;
      case QueryCarTypes.carsForSale:
        this.availableCarStatuses = [
          ...StatusesByCarsForSale.map((s) => ({ label: s, value: s })),
        ];
        break;
      case QueryCarTypes.carsForSaleTemp:
        this.availableCarStatuses = [
          ...StatusesCarsForSaleTemp.map((s) => ({ label: s, value: s })),
        ];
        break;
      case QueryCarTypes.shootedBase:
        this.availableCarStatuses = [
          ...StatusesByShootedBase.map((s) => ({ label: s, value: s })),
        ];
        break;
      default:
        this.availableCarStatuses = [];
    }
  }

  getDate: (item: ServerCar.Response) => string = (c) => {
    if (
      this.type !== QueryCarTypes.carsForSale &&
      this.type !== QueryCarTypes.allCallBaseReady &&
      this.type !== QueryCarTypes.myCallBaseReady &&
      this.type !== QueryCarTypes.carsForSaleTemp
    ) {
      try {
        const firstStatusChange = FieldsUtils.getFieldStringValue(
          c,
          FieldNames.Car.dateOfFirstStatusChange,
        );

        const date = new Date(+(firstStatusChange || '') || +c.createdDate);
        return date instanceof Date ? DateUtils.getFormatedDate(+date) : '';
      } catch (error) {
        console.error(error);
        return c.createdDate;
      }
    } else {
      return DateUtils.getFormatedDate(
        +(FieldsUtils.getFieldValue(c, FieldNames.Car.shootingDate) || 0),
      );
    }
  };

  private getGridConfig(): GridConfigItem<ServerCar.Response>[] {
    const configs: GridConfigItem<ServerCar.Response>[] = [
      {
        title: this.strings.id,
        name: 'id',
        getValue: (item) => {
          const user = FieldsUtils.getFieldValue(
            item,
            FieldNames.Car.contactCenterSpecialist,
          );
          if (user) {
            const contactCenterSpecialist: ServerUser.Response = JSON.parse(
              user || '{}',
            );
            const contactCenterSpecialistName = FieldsUtils.getFieldValue(
              contactCenterSpecialist,
              FieldNames.User.name,
            );

            return `${item.id} ${(contactCenterSpecialistName || '')
              .split(' ')
              .map((word) => (word.match(/\d/g) ? word : word[0]))
              .join('')}`;
          } else {
            return item.id;
          }
        }, // TODO! ,
      },
      this.type !== QueryCarTypes.carsForSale &&
      this.type !== QueryCarTypes.carsForSaleTemp
        ? {
            title: this.strings.date,
            name: 'id',
            getValue: (item) => this.getDate(item),
            available: () =>
              !(
                this.sessionService.isCarSales ||
                this.sessionService.isCarSalesChief
              ),
            isDate: true,
            sortable: () => true,
          }
        : {
            title: this.strings.shootingDate,
            name: FieldNames.Car.shootingDate,
            getValue: (item) => this.getDate(item),
            available: () => true, // this.type !== QueryCarTypes.carsForSale && (this.sessionService.isCarShooting || this.sessionService.isCarShootingChief || this.sessionService.isCustomerService || this.sessionService.isCustomerServiceChief),
            isDate: true,
            sortable: () => true,
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
        getValue: (item) =>
          FieldsUtils.getFieldStringValue(item, FieldNames.CarOwner.name),
        available: () =>
          !(
            this.sessionService.isCarSales ||
            this.sessionService.isCarSalesChief
          ),
      },
      {
        title: this.strings.ownerNumber,
        name: 'ownerNumber',
        getValue: (item) => item.ownerNumber,
        available: () =>
          !(
            this.sessionService.isCarSales ||
            this.sessionService.isCarSalesChief
          ),
      },
      {
        title: this.strings.brandAndModel,
        name: `${FieldNames.Car.mark}/${FieldNames.Car.model}`,
        getValue: (item) =>
          `${FieldsUtils.getFieldValue(item, FieldNames.Car.mark)} ${FieldsUtils.getFieldValue(item, FieldNames.Car.model)}`,
        sortable: () => true,
      },
      {
        title: this.strings.year,
        name: 'year',
        getValue: (item) =>
          FieldsUtils.getFieldValue(item, FieldNames.Car.year),
      },
      {
        title: this.strings.worksheet,
        name: 'worksheet',
        getValue: (item) => {
          let worksheet: ICarForm | null;
          try {
            const worksheetSource =
              FieldsUtils.getFieldStringValue(item, FieldNames.Car.worksheet) ||
              '';
            worksheet = JSON.parse(worksheetSource);
          } catch (error) {
            worksheet = null;
          }

          const form = new RealCarForm(worksheet);

          return form.getValidation() ? 'Есть' : 'Нет';
        },
        available: () =>
          this.sessionService.isCarSales ||
          this.sessionService.isCarSalesChief ||
          this.sessionService.isCarShooting ||
          this.sessionService.isCarShootingChief ||
          this.sessionService.isCustomerService ||
          this.sessionService.isCustomerServiceChief,
      },
      {
        title: this.strings.engine,
        name: 'engine',
        getValue: (item) =>
          FieldsUtils.getDropdownValue(item, FieldNames.Car.engine),
        available: () =>
          !(
            this.sessionService.isContactCenter ||
            this.sessionService.isContactCenterChief
          ),
      },
      {
        title: 'О-м',
        name: 'engineCapacity',
        getValue: (item) =>
          FieldsUtils.getFieldValue(item, FieldNames.Car.engineCapacity),
        available: () =>
          !(
            this.sessionService.isContactCenter ||
            this.sessionService.isContactCenterChief
          ),
      },
      {
        title: this.strings.transmission,
        name: 'transmission',
        getValue: (item) =>
          FieldsUtils.getDropdownValue(item, FieldNames.Car.transmission),
        available: () =>
          !(
            this.sessionService.isContactCenter ||
            this.sessionService.isContactCenterChief
          ),
      },
      {
        title: this.strings.bodyType,
        name: 'body-type',
        getValue: (item) =>
          FieldsUtils.getDropdownValue(item, FieldNames.Car.bodyType),
        available: () =>
          !(
            this.sessionService.isContactCenter ||
            this.sessionService.isContactCenterChief
          ),
      },
      {
        title: this.strings.color,
        name: 'color',
        getValue: (item) =>
          FieldsUtils.getFieldValue(item, FieldNames.Car.color),
        available: () =>
          !(
            this.sessionService.isContactCenter ||
            this.sessionService.isContactCenterChief
          ),
      },
      {
        title: this.strings.driveType,
        name: 'driveType',
        getValue: (item) =>
          FieldsUtils.getDropdownValue(item, FieldNames.Car.driveType),
        available: () =>
          !(
            this.sessionService.isContactCenter ||
            this.sessionService.isContactCenterChief
          ),
      },
      {
        title: this.strings.mileage,
        name: 'mileage',
        getValue: (item) =>
          FieldsUtils.getFieldValue(item, FieldNames.Car.mileage),
        available: () =>
          !(
            this.sessionService.isContactCenter ||
            this.sessionService.isContactCenterChief
          ),
      },
      {
        title: this.strings.linkToAd,
        name: 'linkToAd',
        getValue: (item) =>
          FieldsUtils.getFieldValue(item, FieldNames.Car.linkToAd),
        available: () =>
          !(
            this.sessionService.isCarSales ||
            this.sessionService.isCarSalesChief
          ),
      },
      // {
      //   title: this.strings.trueCarPrice,
      //   name: 'trueCarPrice',
      //   getValue: (item) => '',
      //   available: () => this.sessionService.isCarShooting || this.sessionService.isCarShootingChief,
      // },
      {
        title:
          this.sessionService.isCarShooting ||
          this.sessionService.isCarShootingChief ||
          this.sessionService.isCustomerService ||
          this.sessionService.isCustomerServiceChief ||
          this.sessionService.isCarSales ||
          this.sessionService.isCarSalesChief
            ? this.strings.trueCarPrice
            : this.strings.carOwnerPrice, // TODO!
        name: 'carOwnerPrice',
        getValue: (item) =>
          `${FieldsUtils.getFieldValue(item, FieldNames.Car.carOwnerPrice)}$`,
      },
      {
        title: 'Комис',
        name: 'commission',
        getValue: (item) => {
          const price = +(
            FieldsUtils.getFieldValue(item, FieldNames.Car.carOwnerPrice) || 0
          );
          return `${this.calculateComission(price)}$`;
        },
      },
      {
        title: this.strings.bargain,
        name: 'bargain',
        getValue: (item) => {
          const price = +(
            FieldsUtils.getFieldValue(item, FieldNames.Car.carOwnerPrice) || 0
          );
          return `${this.calculateBargain(price)}$`;
        },
        available: () =>
          this.sessionService.isCarShooting ||
          this.sessionService.isCarShootingChief ||
          this.sessionService.isCustomerService ||
          this.sessionService.isCustomerServiceChief ||
          this.sessionService.isCarSales ||
          this.sessionService.isCarSalesChief ||
          this.sessionService.isContactCenter ||
          this.sessionService.isContactCenterChief,
      },
      {
        title: this.strings.adPrice,
        name: FieldNames.Car.carOwnerPrice,
        getValue: (item) => {
          const price = +(
            FieldsUtils.getFieldValue(item, FieldNames.Car.carOwnerPrice) || 0
          );

          return `${this.calculateComission(price) + this.calculateBargain(price) + price}$`;
        },
        available: () =>
          this.sessionService.isCarShooting ||
          this.sessionService.isCarShootingChief ||
          this.sessionService.isCustomerService ||
          this.sessionService.isCustomerServiceChief ||
          this.sessionService.isCarSales ||
          this.sessionService.isCarSalesChief,
        sortable: () => true,
      },
      {
        title: this.strings.status,
        name: 'status',
        getValue: (item) =>
          FieldsUtils.getDropdownValue(item, FieldNames.Car.status),
        available: () =>
          !(
            this.sessionService.isCarSales ||
            this.sessionService.isCarSalesChief
          ),
      },
      {
        title: this.strings.comment,
        name: 'comment',
        getValue: (item) =>
          FieldsUtils.getFieldValue(item, FieldNames.Car.comment),
        available: () =>
          this.sessionService.isContactCenter ||
          this.sessionService.isContactCenterChief,
      },
      {
        title: this.strings.shootingDate,
        name: FieldNames.Car.shootingDate,
        getValue: (item) =>
          DateUtils.getFormatedDate(
            +(
              FieldsUtils.getFieldValue(item, FieldNames.Car.shootingDate) || 0
            ),
          ),
        available: () =>
          this.type !== QueryCarTypes.carsForSale &&
          this.type !== QueryCarTypes.carsForSaleTemp &&
          (this.sessionService.isCarShooting ||
            this.sessionService.isCarShootingChief ||
            this.sessionService.isCustomerService ||
            this.sessionService.isCustomerServiceChief),
        isDate: true,
        sortable: () => true,
      },
      {
        title: this.strings.shootingTime,
        name: 'shootingTime',
        getValue: (item) =>
          moment(
            new Date(
              +(
                FieldsUtils.getFieldValue(item, FieldNames.Car.shootingDate) ||
                0
              ),
            ),
          ).format('HH:mm'),
        available: () =>
          this.type !== QueryCarTypes.carsForSale &&
          this.type !== QueryCarTypes.carsForSaleTemp &&
          (this.sessionService.isCarShooting ||
            this.sessionService.isCarShootingChief ||
            this.sessionService.isCustomerService ||
            this.sessionService.isCustomerServiceChief),
      },
      {
        title: this.strings.dateOfLastCustomerCall,
        name: FieldNames.Car.dateOfLastCustomerCall,
        getValue: (item) =>
          DateUtils.getFormatedDate(
            +(
              FieldsUtils.getFieldValue(
                item,
                FieldNames.Car.dateOfLastCustomerCall,
              ) || 0
            ),
          ),
        available: () =>
          (this.type === QueryCarTypes.carsForSale ||
            this.type === QueryCarTypes.carsForSaleTemp) &&
          (this.sessionService.isCustomerService ||
            this.sessionService.isCustomerServiceChief),
        isDate: true,
        sortable: () => true,
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
        getValue: (item) =>
          (FieldsUtils.getFieldValue(item, FieldNames.Car.ourLinks) || '')
            ?.split(',')
            .filter((l) => l).length,
        available: () =>
          this.sessionService.isCustomerService ||
          this.sessionService.isCustomerServiceChief,
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
        getValue: (item) =>
          FieldsUtils.getFieldValue(item, FieldNames.Car.dateOfNextAction),
        available: () =>
          this.sessionService.isContactCenter ||
          this.sessionService.isContactCenterChief,
      },
    ];

    return configs.filter((config) => !config.available || config.available());
  }

  private getGridActionsConfig(): GridActionConfigItem<ServerCar.Response>[] {
    const configs: GridActionConfigItem<ServerCar.Response>[] = [
      {
        title: 'Копировать телефоны',
        icon: 'save',
        buttonClass: 'secondary',
        disabled: () => false,
        available: () =>
          this.sessionService.isContactCenter ||
          this.sessionService.isContactCenterChief,
        handler: (car) => this.copyPhonesToClipboard(),
      },
      {
        title: 'Копировать ссылки',
        icon: 'save',
        buttonClass: 'secondary',
        disabled: () => false,
        available: () =>
          this.sessionService.isContactCenter ||
          this.sessionService.isContactCenterChief,
        handler: (car) => this.copyLinksToClipboard(),
      },
      {
        title: 'Редактировать',
        icon: 'pencil',
        buttonClass: 'secondary',
        disabled: () => false,
        available: () =>
          this.sessionService.isAdminOrHigher ||
          this.sessionService.isCarShooting ||
          this.sessionService.isCarShootingChief ||
          this.sessionService.isCustomerService ||
          this.sessionService.isCustomerServiceChief,
        handler: (car) => this.updateCar(car),
      },
      {
        title: 'Удалить',
        icon: 'times',
        buttonClass: 'danger',
        available: () => this.sessionService.isAdminOrHigher,
        handler: (car) => this.deleteCar(car),
      },
      {
        title: '[ОКЦ] Звонок',
        icon: 'mobile',
        buttonClass: 'secondary',
        available: () =>
          this.sessionService.isAdminOrHigher ||
          this.sessionService.isContactCenter ||
          this.sessionService.isContactCenterChief,
        handler: (car) => this.contactCenterCall(car),
      },
      {
        title: '[ОКЦ] Поменять телефон',
        icon: 'mobile',
        buttonClass: 'secondary',
        available: () =>
          this.sessionService.isRealAdminOrHigher ||
          this.sessionService.isContactCenter ||
          this.sessionService.isContactCenterChief,
        handler: (car) => this.changePhoneNumber(car),
      },
      {
        title: 'Передать в ОСА',
        icon: 'check',
        buttonClass: 'primary',
        available: () =>
          this.sessionService.isAdminOrHigher ||
          this.sessionService.isContactCenterChief,
        handler: (car) => this.transformToCarShooting(car),
      },
      {
        title: 'Анкета',
        icon: 'id-card',
        buttonClass: 'secondary',
        available: () =>
          this.sessionService.isAdminOrHigher ||
          this.sessionService.isCarShooting ||
          this.sessionService.isCarShootingChief ||
          this.sessionService.isCarSales ||
          this.sessionService.isCarSalesChief ||
          this.sessionService.isCustomerService ||
          this.sessionService.isCustomerServiceChief,
        handler: (car) => this.createOrEditCarForm(car),
      },
      {
        title: 'Создать клиента',
        icon: 'pi pi-fw pi-mobile',
        buttonClass: 'secondary',
        handler: (car) => this.createClient(car),
        available: () =>
          this.sessionService.isCarSales || this.sessionService.isCarSalesChief,
      },
      {
        title: 'Медиа',
        icon: 'camera',
        buttonClass: 'secondary',
        available: () =>
          !(
            this.sessionService.isContactCenter ||
            this.sessionService.isContactCenterChief
          ),
        handler: (car) => this.uploadMedia(car),
      },
      {
        title: 'Вернуть в ОКЦ',
        icon: 'caret-left',
        buttonClass: 'danger',
        available: () =>
          this.sessionService.isAdminOrHigher ||
          this.sessionService.isCarShooting ||
          this.sessionService.isCarShootingChief,
        handler: (car) => this.returnToContactCenter(car),
      },
      {
        title: 'Передать в ОРК',
        icon: 'caret-right',
        buttonClass: 'primary',
        available: () =>
          this.sessionService.isAdminOrHigher ||
          this.sessionService.isCarShooting ||
          this.sessionService.isCarShootingChief,
        handler: (car) => this.transformToCustomerService(car),
      },
      {
        title: 'Вернуть в ОСА',
        icon: 'caret-left',
        buttonClass: 'danger',
        available: () =>
          this.type === QueryCarTypes.shootedBase &&
          (this.sessionService.isAdminOrHigher ||
            this.sessionService.isCustomerService ||
            this.sessionService.isCustomerServiceChief),
        handler: (car) => this.returnToShootingCar(car),
      },
      {
        title: 'Опубликовать машину',
        icon: 'caret-right',
        buttonClass: 'primary',
        available: () =>
          this.type === QueryCarTypes.shootedBase &&
          (this.sessionService.isAdminOrHigher ||
            this.sessionService.isCustomerService ||
            this.sessionService.isCustomerServiceChief),
        handler: (car) => this.transformToCustomerServiceAprooved(car),
      },
      {
        title: 'Поставить на паузу',
        icon: 'pause',
        buttonClass: 'primary',
        available: () =>
          (this.type === QueryCarTypes.carsForSale ||
            this.type === QueryCarTypes.carsForSaleTemp) &&
          (this.sessionService.isAdminOrHigher ||
            this.sessionService.isCustomerService ||
            this.sessionService.isCustomerServiceChief),
        disabled: (car) =>
          car
            ? getCarStatus(car) === FieldNames.CarStatus.customerService_OnPause
            : true,
        handler: (car) => this.transformToCustomerServicePause(car),
      },
      {
        title: 'Снять с паузы',
        icon: 'pause',
        buttonClass: 'primary',
        available: () =>
          (this.type === QueryCarTypes.carsForSale ||
            this.type === QueryCarTypes.carsForSaleTemp) &&
          (this.sessionService.isAdminOrHigher ||
            this.sessionService.isCustomerService ||
            this.sessionService.isCustomerServiceChief),
        disabled: (car) =>
          !car ||
          !(getCarStatus(car) === FieldNames.CarStatus.customerService_OnPause),
        handler: (car) => this.transformToCustomerServicePause(car, true),
      },
      {
        title: 'Поставить на удаление',
        icon: 'times',
        buttonClass: 'danger',
        available: () =>
          (this.type === QueryCarTypes.carsForSale ||
            this.type === QueryCarTypes.carsForSaleTemp) &&
          (this.sessionService.isAdminOrHigher ||
            this.sessionService.isCustomerService ||
            this.sessionService.isCustomerServiceChief),
        handler: (car) => this.transformToCustomerServiceDelete(car),
      },
      {
        title: '[ОРК] Звонок',
        icon: 'mobile',
        buttonClass: 'secondary',
        available: () =>
          (this.type === QueryCarTypes.carsForSale ||
            this.type === QueryCarTypes.carsForSaleTemp) &&
          (this.sessionService.isAdminOrHigher ||
            this.sessionService.isCustomerService ||
            this.sessionService.isCustomerServiceChief),
        handler: (car) => this.сustomerServiceCall(car),
      },
    ];

    console.log(
      configs.filter((config) => !config.available || config.available()),
    );
    return configs.filter((config) => !config.available || config.available());
  }

  calculateComission(price: number) {
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

  calculateBargain(price: number) {
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

  setGridSettings(): void {
    this.gridConfig = this.getGridConfig();
    this.gridActionsConfig = this.getGridActionsConfig();
    this.getGridColorConfig();
  }

  getGridColorConfig(): void {
    this.getColorConfig = (car) => {
      const status = getCarStatus(car);

      switch (status) {
        case FieldNames.CarStatus.contactCenter_WaitingShooting:
          return '#008000a3';
        case FieldNames.CarStatus.contactCenter_MakingDecision:
          return 'yellow';
        case FieldNames.CarStatus.contactCenter_NoAnswer:
          return 'orange';
        case FieldNames.CarStatus.contactCenter_Refund:
          return '#80008080';

        default:
          return '';
      }
    };
  }

  copyPhonesToClipboard() {
    const text = `${this.sortedCars.map((c) => c.ownerNumber).join(`\n`)}`;

    if (typeof navigator.clipboard == 'undefined') {
      console.log('navigator.clipboard');
      var textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed'; //avoid scrolling to bottom
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

      document.body.removeChild(textArea);
      return;
    }
    navigator.clipboard &&
      navigator.clipboard.writeText(text).then(
        function () {
          console.log(`successful!`);
        },
        function (err) {
          console.log('unsuccessful!', err);
        },
      );
  }

  copyLinksToClipboard() {
    const text = `${this.sortedCars
      .map((c) => FieldsUtils.getFieldValue(c, FieldNames.Car.linkToAd))
      .join(`\n`)}`;

    if (typeof navigator.clipboard == 'undefined') {
      console.log('navigator.clipboard');
      var textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed'; //avoid scrolling to bottom
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

      document.body.removeChild(textArea);
      return;
    }
    navigator.clipboard &&
      navigator.clipboard.writeText(text).then(
        function () {
          console.log(`successful!`);
        },
        function (err) {
          console.log('unsuccessful!', err);
        },
      );
  }
  // чекнуть потом нужен ли был кар при подписке на сабскрайб форму, лучше его мб передавать в data параметрах
  contactCenterCall(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [
          FieldNames.CarStatus.contactCenter_MakingDecision,
          FieldNames.CarStatus.contactCenter_NoAnswer,
          FieldNames.CarStatus.contactCenter_Deny,
          FieldNames.CarStatus.contactCenter_WaitingShooting,
          FieldNames.CarStatus.contactCenter_InProgress,
        ],
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
        isNextActionDateAvailable: true,
        dateOfNextAction: FieldsUtils.getFieldValue(
          car,
          FieldNames.Car.dateOfNextAction,
        ),
        dateOfFirstStatusChangeAvailable: !FieldsUtils.getFieldStringValue(
          car,
          FieldNames.Car.dateOfFirstStatusChange,
        ),
        dateOfFirstStatusChange: FieldsUtils.getFieldStringValue(
          car,
          FieldNames.Car.dateOfFirstStatusChange,
        ),
      },
      header: 'Звонок',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  changePhoneNumber(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarOwnerNumberComponent, {
      data: {
        carId: car.id,
        ownerNumber: car.ownerNumber,
      },
      header: 'Поменять телефон',
      width: '70%',
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
        readOnly:
          this.sessionService.isCarSales || this.sessionService.isCarSalesChief,
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

  returnToContactCenter(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [FieldNames.CarStatus.contactCenter_Refund],
        commentIsRequired: true,
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: 'Вернуть отделу ОКЦ',
      width: '70%',
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

  transformToCustomerService(car: ServerCar.Response) {
    // добавить логику лоадинга
    this.validatePublish(car)
      .pipe()
      .subscribe(
        (res) => {
          if (res) {
            const ref = this.dialogService.open(ChangeCarStatusComponent, {
              data: {
                carId: car.id,
                availableStatuses: [FieldNames.CarStatus.carShooting_Ready],
                comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
              },
              header: 'Передать отделу ОРК',
              width: '70%',
            });

            this.subscribeOnCloseModalRef(ref);
          }
        },
        (err) => {
          alert(
            'Произошла ошибка, запомните шаги которые привели к такой ситуации, сообщите администарутору.',
          );
          console.error(err);
        },
      );
  }

  returnToShootingCar(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [FieldNames.CarStatus.carShooting_Refund],
        commentIsRequired: true,
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: 'Вернуть отделу ОСА',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  transformToCustomerServiceAprooved(car: ServerCar.Response) {
    // loading

    this.validatePublish(car)
      .pipe(takeUntil(this.destroyed))
      .subscribe(
        (res) => {
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

            this.subscribeOnCloseModalRef(ref);
          }
        },
        (err) => {
          alert(
            'Произошла ошибка, запомните шаги которые привели к такой ситуации, сообщите администарутору.',
          );
          console.error(err);
        },
      );
  }

  createClient(car: ServerCar.Response) {
    // ебашу подгрузку клаентконфигов тут а не на ините тк они только тут и юзаются
    this.fieldService
      .getFieldsByDomain(FieldDomains.Client)
      .pipe(take(1))
      .subscribe((clientfieldConfigs) => {
        const ref = this.dialogService.open(CreateClientComponent, {
          data: {
            predefinedCar: car,
            fieldConfigs: clientfieldConfigs,
          },
          header: 'Новый клиент',
          width: '70%',
        });

        // в оригинале подписки почему то не было
        this.subscribeOnCloseModalRef(ref);
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
      header: isReverse ? 'Снять с паузы' : 'Поставить на паузу',
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
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  transformToCustomerServiceDelete(car: ServerCar.Response) {
    const ref = this.dialogService.open(ChangeCarStatusComponent, {
      data: {
        carId: car.id,
        availableStatuses: [FieldNames.CarStatus.customerService_OnDelete],
        comment: FieldsUtils.getFieldValue(car, FieldNames.Car.comment),
      },
      header: 'Поставить на удаление',
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  subscribeOnCloseModalRef(ref: DynamicDialogRef) {
    ref.onClose.subscribe((res) => {
      if (res) {
        this.filter(false);
      }
    });
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
      width: '70%',
    });

    this.subscribeOnCloseModalRef(ref);
  }

  deleteCar(car: ServerCar.Response) {
    const ok = confirm(
      `Вы уверены что хотите удалить машину со статусом ${getCarStatus(car)}`,
    );

    if (ok) {
      // писал сам
      this.carsBaseDataService
        .deleteCar(car.id)
        .pipe(finalize(() => this.carsBaseDataService.fetchData()));

      // .pipe(
      //   // хуйня какая-то долго просидел, так и не понял в чем дело An expression of type 'void' cannot be tested for truthiness., в клиентах работает хз
      //   mergeMap( res => res &&  || of(null))
      // )
    }
  }

  private validatePublish(car: ServerCar.Response): Observable<boolean> {
    if (!FieldsUtils.getFieldValue(car, FieldNames.Car.worksheet)) {
      alert('У авто нету анкеты!');
      return of(false);
    }

    let worksheet: ICarForm | null;
    try {
      const worksheetSource =
        FieldsUtils.getFieldStringValue(car, FieldNames.Car.worksheet) || '';
      worksheet = JSON.parse(worksheetSource);
    } catch (error) {
      worksheet = null;
    }

    const form = new RealCarForm(worksheet);

    if (!form.getValidation()) {
      alert('Анкета не заполнена!');
      return of(false);
    }

    return this.carService.getCarsImages(car.id).pipe(
      map((images) => {
        const carImages = images.filter(
          (image) => image.type === ServerFile.Types.Image,
        );
        const image360 = images.find(
          (image) => image.type === ServerFile.Types.Image360,
        );
        const stateImages = images.filter(
          (image) => image.type === ServerFile.Types.StateImage,
        );

        if (!carImages.length || !image360 || !stateImages.length) {
          !carImages.length && alert('У машины нету фотографий.');
          !image360 && alert('У машины нету фото 360.');
          !stateImages.length && alert('У машины нету фотографий техпаспорта.');
          return false;
        }

        return true;
      }),
    );
  }

  private generateFilters() {
    const transmissionField = this.carFieldConfigs.find(
      (config) => config.name === FieldNames.Car.transmission,
    );
    const engineField = this.carFieldConfigs.find(
      (config) => config.name === FieldNames.Car.engine,
    );
    const driveTypeField = this.carFieldConfigs.find(
      (config) => config.name === FieldNames.Car.driveType,
    );
    const bodyTypeField = this.carFieldConfigs.find(
      (config) => config.name === FieldNames.Car.bodyType,
    );

    if (
      !transmissionField ||
      !engineField ||
      !driveTypeField ||
      !bodyTypeField
    ) {
      console.log('Поля не найдены в carFieldConfigs');
      return;
    }

    const createVariants = (field: ServerField.Response) => {
      return new UIRealField(field, 'd').variants.map((variant) => ({
        label: variant.value,
        value: variant.key,
      }));
    };

    this.filters = [
      {
        title: this.strings.mileage,
        name: FieldNames.Car.mileage,
        type: FieldType.Number,
        values: [0, 300000],
        defaultValues: [0, 300000],
        max: 300000,
        min: 0,
        step: 10000,
      },
      {
        title: this.strings.transmission,
        name: FieldNames.Car.transmission,
        type: FieldType.Multiselect,
        value: [],
        defaultValue: [],
        variants: [...createVariants(transmissionField)],
      },
      {
        title: this.strings.color,
        name: FieldNames.Car.color,
        type: FieldType.Text,
        value: '',
        defaultValue: '',
      },
      {
        title: this.strings.engineCapacity,
        name: FieldNames.Car.engineCapacity,
        type: FieldType.Number,
        values: [1.0, 5.0],
        defaultValues: [1.0, 5.0],
        max: 5.0,
        min: 1.0,
        step: 0.1,
      },
      {
        title: this.strings.driveType,
        name: FieldNames.Car.driveType,
        type: FieldType.Multiselect,
        value: [],
        defaultValue: [],
        variants: [...createVariants(driveTypeField)],
      },
      {
        title: this.strings.bodyType,
        name: FieldNames.Car.bodyType,
        type: FieldType.Multiselect,
        value: [],
        defaultValue: [],
        variants: [...createVariants(bodyTypeField)],
      },
      {
        title: this.strings.year,
        name: FieldNames.Car.year,
        type: FieldType.Number,
        values: [1990, new Date().getFullYear()],
        defaultValues: [1990, new Date().getFullYear()],
        max: new Date().getFullYear(),
        min: 1990,
        step: 1,
      },
      {
        title: this.strings.engine,
        name: FieldNames.Car.engine,
        type: FieldType.Multiselect,
        value: [],
        defaultValue: [],
        variants: [...createVariants(engineField)],
      },
      {
        title: this.strings.carOwnerPrice,
        name: FieldNames.Car.carOwnerPrice,
        type: FieldType.Number,
        values: [5000, 50000],
        defaultValues: [5000, 50000],
        max: 50000,
        min: 5000,
        step: 500,
      },
    ];
  }

  changeFilter(
    filterConfig: TextUIFilter,
    e: { originalEvent: PointerEvent | Event; value: string },
  ) {
    if ((filterConfig.type as unknown) === this.FieldTypes.Number) {
      return;
    }

    if (this.selectedFilters[filterConfig.name]) {
      if (filterConfig.defaultValue === e.value) {
        delete this.selectedFilters[filterConfig.name];
      } else {
        this.selectedFilters[filterConfig.name] = {
          [filterConfig.name]: e.value,
        };
      }
    } else if (filterConfig.defaultValue !== e.value) {
      this.selectedFilters[filterConfig.name] = {
        [filterConfig.name]: e.value,
      };
    }
  }

  changeMultiselectFilter(
    filterConfig: MultiselectUIFilter,
    e: {
      originalEvent: PointerEvent | Event;
      value: string[];
      itemValue?: string;
    },
  ) {
    if ((filterConfig.type as unknown) === FieldType.Number) {
      return;
    }
    if (this.selectedFilters[filterConfig.name]) {
      if (filterConfig.defaultValue.length === e.value.length) {
        // TODO improve array comparing expression
        delete this.selectedFilters[filterConfig.name];
      } else {
        this.selectedFilters[filterConfig.name] = {
          [filterConfig.name]: e.value,
        };
      }
    } else if (filterConfig.defaultValue !== e.value) {
      this.selectedFilters[filterConfig.name] = {
        [filterConfig.name]: e.value,
      };
    }
    console.log(this.selectedFilters);
  }

  changeNumberRangeFilter(
    filterConfig: NumberUIFilter,
    e: { values?: number[] },
  ) {
    if (filterConfig.type !== this.FieldTypes.Number || !e.values) {
      return;
    }

    let value: any = {
      [filterConfig.name]: `${e.values[0]}-${e.values[1]}`,
      [`filter-operator-${filterConfig.name}`]: 'range',
    };

    if (
      filterConfig?.type === this.FieldTypes.Number &&
      e.values[1] === filterConfig.max
    ) {
      value = {
        [filterConfig.name]: e.values[0],
        [`filter-operator-${filterConfig.name}`]: '>',
      };
    }

    if (
      filterConfig?.type === this.FieldTypes.Number &&
      e.values[0] === filterConfig.min
    ) {
      value = {
        [filterConfig.name]: e.values[1],
        [`filter-operator-${filterConfig.name}`]: '<',
      };
    }

    if (this.selectedFilters[filterConfig.name]) {
      if (
        filterConfig.defaultValues[0] === e.values[0] &&
        filterConfig.defaultValues[1] === e.values[1]
      ) {
        delete this.selectedFilters[filterConfig.name];
      } else {
        this.selectedFilters[filterConfig.name] = value;
      }
    } else if (
      !(
        filterConfig.defaultValues[0] === e.values[0] &&
        filterConfig.defaultValues[1] === e.values[1]
      )
    ) {
      this.selectedFilters[filterConfig.name] = value;
    }
  }

  transformFormInputEvent(e: Event): {
    originalEvent: PointerEvent | Event;
    value: string;
  } {
    const inputTarget: HTMLInputElement = e.target as HTMLInputElement;

    return {
      originalEvent: e,
      value: inputTarget.value,
    };
  }

  setDefaultStatuses() {
    let statuses: FieldNames.CarStatus[] = [];
    switch (this.type) {
      case QueryCarTypes.byAdmin:
        statuses = [
          FieldNames.CarStatus.contactCenter_InProgress,
          FieldNames.CarStatus.contactCenter_NoAnswer,
          FieldNames.CarStatus.contactCenter_MakingDecision,
          FieldNames.CarStatus.contactCenter_WaitingShooting,
          FieldNames.CarStatus.contactCenter_Deny,
          FieldNames.CarStatus.contactCenter_Refund,
          FieldNames.CarStatus.carShooting_InProgres,
          FieldNames.CarStatus.carShooting_Refund,
          FieldNames.CarStatus.carShooting_Ready,
          FieldNames.CarStatus.customerService_InProgress,
          FieldNames.CarStatus.customerService_OnPause,
          FieldNames.CarStatus.customerService_OnDelete,
          FieldNames.CarStatus.customerService_Sold,
          FieldNames.CarStatus.carSales_Deposit,
          FieldNames.CarStatus.admin_Deleted,
        ];
        break;
      case QueryCarTypes.myCallBase:
        statuses = [
          FieldNames.CarStatus.contactCenter_WaitingShooting,
          FieldNames.CarStatus.contactCenter_InProgress,
          FieldNames.CarStatus.contactCenter_MakingDecision,
          FieldNames.CarStatus.contactCenter_NoAnswer,
          FieldNames.CarStatus.contactCenter_Refund,
        ];

        break;
      case QueryCarTypes.allCallBase:
        statuses = [
          FieldNames.CarStatus.contactCenter_WaitingShooting,
          FieldNames.CarStatus.contactCenter_Refund,
        ];

        break;
      case QueryCarTypes.myShootingBase:
      case QueryCarTypes.allShootingBase:
        statuses = [
          FieldNames.CarStatus.carShooting_InProgres,
          FieldNames.CarStatus.carShooting_Refund,
        ];

        break;
      case QueryCarTypes.carsForSaleTemp:
      case QueryCarTypes.carsForSale:
        statuses = [
          FieldNames.CarStatus.customerService_InProgress,
          FieldNames.CarStatus.customerService_OnPause,
        ];

        break;
    }

    this.form.get(FieldNames.Car.status)?.setValue(statuses);

    let filters = skipEmptyFilters({ ...structuredClone(this.form.value) });
    if (filters.status?.length) {
      const { status, ...rest } = filters;
      if (status.length !== Object.keys(FieldNames.CarStatus).length) {
        filters = { status: status, ...rest };
      } else {
        filters = rest;
      }
    } else {
      if (this.availableCarStatuses.length > 0) {
        const { status, ...rest } = filters;
        filters = {
          status: this.availableCarStatuses.map((s) => s.value),
          ...rest,
        };
      }
    }

    this.carsBaseDataService.updateFilters({ page: 1, ...filters });
  }

  ngOnDestroy(): void {
    this.destroyed.next(null);
    this.carsBaseDataService.list.set({
      list: [],
      total: 0,
    });
  }
}
