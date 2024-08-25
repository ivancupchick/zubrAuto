import { Injectable, OnDestroy } from '@angular/core';
import { PageagleGridService } from '../../../shared/pageagle-grid/pageagle-grid.service';
import { BehaviorSubject, Observable, Subject, finalize, takeUntil } from 'rxjs';
import { BaseList } from 'src/app/entities/constants';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { SortDirection } from 'src/app/shared/enums/sort-direction.enum';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { ServerClient } from 'src/app/entities/client';
import { ServerField } from 'src/app/entities/field';
import { CreateClientComponent } from '../../../modals/create-client/create-client.component';
import { ServerUser } from 'src/app/entities/user';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

const API = 'clients';

type ClientBaseFilters = {
  [key: string]: number | string;
};

@Injectable({
  providedIn: 'root'
})
export class ClientBaseService extends PageagleGridService<ServerClient.Response> implements OnDestroy {

  fieldConfigs: ServerField.Response[] = [];
  specialists: ServerUser.Response[] = [];

  private loading = new BehaviorSubject<boolean>(false);
  public loading$ = this.loading.asObservable();

  public clientBaseItems = new BehaviorSubject<BaseList<ServerClient.Response>>({ list: [], total: 0 });
  public list$ = this.clientBaseItems.asObservable();

  private payload: ClientBaseFilters = {
    page: 1,
    size: 10
  };

  private destroy$ = new Subject();

  constructor(
    private requestService: RequestService,
    private dialogService: DialogService,
  
  ) {
    super()
  }

  public fetchData() {
    this.loading.next(true);

    this.requestService.get<BaseList<ServerClient.Response>>(`${environment.serverUrl}/${API}`, this.payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.next(false))
      )
      .subscribe((res) => {
        this.clientBaseItems.next(res);

      });
  }

  public updatePage(payload: { size: number; page: number; sortField?: string; sortOrder?: SortDirection; }): void {
    [
      this.payload.size,
      this.payload.page
    ] = [
      payload.size,
      payload.page
    ];

    if (payload.sortField && payload.sortOrder) {
      [
        this.payload.sortField,
        this.payload.sortOrder
      ] = [
        payload.sortField,
        payload.sortOrder
      ];
    }

    this.fetchData();
  }

  public onFilter(filters: ClientBaseFilters) {
    const payload = {
      size: this.payload.size,
      page: 1,
      ...skipEmptyFilters(filters)
    };

    if (this.payload.sortField && this.payload.sortOrder) {
      [
        payload.sortField,
        payload.sortOrder
      ] = [
        this.payload.sortField,
        this.payload.sortOrder
      ];
    }

    this.payload = payload;

    this.fetchData();
  }

  // public fetchChangeLogsById(payload: { size: number; page: number; sourceId: number, sourceName: string }): Observable<BaseList<ServerClient.Response>> {
  //   return this.requestService.get<BaseList<ServerClient.Response>>(`${environment.serverUrl}/${API}`, {...payload })
  // }

  // getData(): Observable<ServerCar.Response[]> {
  //   return zip(this.getClients(), this.clientService.getClientFields(), this.userService.getAllUsers(true)).pipe(
  //     takeUntil(this.destoyed),
  //     switchMap(([clientsRes, clientFieldsRes, usersFieldsRes]) => {
  //       this.fieldConfigs = clientFieldsRes;
  //       this.allUsers = usersFieldsRes.list;
  //       this.specialists = usersFieldsRes.list.filter((s: any) => +s.deleted === 0)
  //         .filter(u => u.customRoleName === ServerRole.Custom.carSales
  //                   || u.customRoleName === ServerRole.Custom.carSalesChief
  //                   || u.customRoleName === ServerRole.Custom.customerService
  //                   || u.customRoleName === ServerRole.Custom.customerServiceChief
  //                   || (
  //                     (
  //                       u.roleLevel === ServerRole.System.Admin || u.roleLevel === ServerRole.System.SuperAdmin
  //                     )
  //                   ));

  //       this.availableSpecialists = [
  //         {label: 'Никто', value: 'None' },
  //         ...this.specialists.map(u => ({ label: FieldsUtils.getFieldStringValue(u, FieldNames.User.name), value: `${u.id}` }))
  //       ];

  //       const carIds = clientsRes.list.reduce<number[]>((prev, client) => {
  //         const clietnCarIds = client.carIds.split(',').map(id => +id);
  //         return [...prev, ...clietnCarIds];
  //       }, []).filter(id => id && !Number.isNaN(id));

  //       if (carIds.length === 0) {
  //         return of([]);
  //       };

  //       const query: StringHash = { id: [...(new Set(carIds))].join(',') };


  //       return this.carService.getCarsByQuery(query);
  //     })
  //   );
  // }

  updateClient = (client: ServerClient.Response) => {
    const ref = this.dialogService.open(CreateClientComponent, {
      data: {
        client,
        fieldConfigs: this.fieldConfigs,
        specialists: this.specialists,
      },
      header: 'Редактировать клиента',
      width: '70%'
    });

    // this.subscribeOnCloseModalRef(ref);
  }

  // subscribeOnCloseModalRef(ref: DynamicDialogRef) {
  //   ref.onClose.pipe(takeUntil(this.destroy$)).subscribe(res => {
  //     if (res) {
  //       this.getData().pipe(takeUntil(this.destroy$)).subscribe(cars => {
  //         this.allCars = cars;
  //         this.loading = false;
  //         this.setGridSettings();
  //       });
  //     }
  //   });
  // }
  
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
