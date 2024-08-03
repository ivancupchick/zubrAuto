import { Injectable, OnDestroy, inject } from '@angular/core';
import { PageagleGridService } from '../../../shared/pageagle-grid/pageagle-grid.service';
import { ClientService } from 'src/app/services/client/client.service';
import { BehaviorSubject, Subject, finalize, mergeMap, of, takeUntil, zip } from 'rxjs';
import { ServerClient } from 'src/app/entities/client';
import { BaseList, StringHash } from 'src/app/entities/constants';
import { SortDirection } from 'src/app/shared/enums/sort-direction.enum';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { FieldNames } from 'src/app/entities/FieldNames';
import { CarService } from 'src/app/services/car/car.service';
import { ServerCar } from 'src/app/entities/car';

type  ClientNextActionFilters = {
  [key: string]: number | string;
};

@Injectable()
export class ClientNextActionDataService extends PageagleGridService<ServerClient.Response> implements OnDestroy {
  private loading = new BehaviorSubject<boolean>(false);
  public loading$ = this.loading.asObservable();

  private clients = new BehaviorSubject<BaseList<ServerClient.Response>>({ list: [], total: 0 });
  public list$ = this.clients.asObservable();

  private clientCarsSubject = new BehaviorSubject<ServerCar.Response[]>([]);
  public clientCars$ = this.clientCarsSubject.asObservable();

  private payload: ClientNextActionFilters = {
    page: 1,
    size: 10,
  };

  private destroy$ = new Subject();
  private clientService = inject(ClientService);
  private carService = inject(CarService);

  public fetchData() {
    this.loading.next(true);

    this.clientService.getClientsByQuery(this.payload)
      .pipe(
        mergeMap((clientRes) => {
          const carIds = clientRes.list.reduce<number[]>((prev, client) => {
            const clietnCarIds = client.carIds.split(',').map(id => +id);
            return [...prev, ...clietnCarIds];
          }, []).filter(id => id && !Number.isNaN(id));

          if (carIds.length === 0) {
            return zip(of(clientRes), of([]));
          }

          const query: StringHash = { id: [...(new Set(carIds))].join(',') };

          return zip(of(clientRes), this.carService.getCarsByQuery(query))
        }),
        takeUntil(this.destroy$),
        finalize(() => this.loading.next(false))
      )
      .subscribe(([clientsRes, carsRes]) => {
        this.clientCarsSubject.next(carsRes)
        this.clients.next(clientsRes);
      });
  }

  public updatePage(payload: { size: number; page: number; sortField?: string; sortOrder?: SortDirection; }): void {
    [
      this.payload.size,
      this.payload.page,
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

  public onFilter(ClientNextActionFilters: ClientNextActionFilters) {
    const payload = {
      size: this.payload.size,
      page: 1,
      ...skipEmptyFilters(ClientNextActionFilters)
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

  ngOnDestroy(): void {
    this.destroy$.next(null)
  }
}
