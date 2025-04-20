import { inject, Injectable, OnDestroy } from '@angular/core';
import { PageagleGridService } from '../../../shared/pageagle-grid/pageagle-grid.service';
import {
  BehaviorSubject,
  Observable,
  Subject,
  finalize,
  map,
  mergeMap,
  of,
  takeUntil,
  zip,
} from 'rxjs';
import { BaseList, Constants, StringHash } from 'src/app/entities/constants';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { ServerClient } from 'src/app/entities/client';
import { ServerCar, ServerFile } from 'src/app/entities/car';
import { CarService } from 'src/app/services/car/car.service';

const API = 'cars/crud';

type CarsBaseFilters = {
  [key: string]: number | string | string[];
};

@Injectable({
  providedIn: 'root',
})
export class CarsBaseDataService
  extends PageagleGridService<ServerCar.Response>
  implements OnDestroy
{
  private payload: CarsBaseFilters = {
    page: 1,
    size: 10,
  };

  private loading = new BehaviorSubject<boolean>(true);
  public loading$ = this.loading.asObservable();

  public carsBaseItems = new BehaviorSubject<BaseList<ServerCar.Response>>({
    list: [],
    total: 0,
  });
  public list$ = this.carsBaseItems.asObservable();

  public filters$ = new BehaviorSubject<any>({});

  private destroy$ = new Subject();

  constructor(private requestService: RequestService) {
    super();
  }

  public fetchData(): void {
    this.loading.next(true);
    this.requestService
      .get<BaseList<ServerCar.Response>>(
        `${environment.serverUrl}/${API}`,
        this.filtersObject.getValue(),
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.next(false)),
      )
      .subscribe((carsRes) => {
        console.log(carsRes);
        // this.clientCarsSubject.next(carsRes as unknown as ServerCar.Response[]);
        this.carsBaseItems.next({ list: carsRes.list, total: carsRes.total });
        this.loading.next(false);
      });
  }

  public updatePage(filters: CarsBaseFilters): void {
    const payload: any = {
      size: this.payload.size,
      page: 1,
      ...skipEmptyFilters(filters),
    };

    if (this.payload.sortField && this.payload.sortOrder) {
      [payload.sortField, payload.sortOrder] = [
        this.payload.sortField,
        this.payload.sortOrder,
      ];
    }

    this.filtersObject.next(payload);

    this.fetchData();
  }

  getCarsImages(id: number) {
    return this.requestService
      .get<
        ServerFile.Response[]
      >(`${environment.serverUrl}/${API}/${Constants.API.IMAGES}/${id}`)
      .pipe(
        map((result) => {
          console.log(result);

          return result;
        }),
      );
  }

  deleteCar(id: number): Observable<Boolean> {
    return this.requestService
      .delete<ServerCar.Response>(
        `${environment.serverUrl}/${API}/${Constants.API.CRUD}/${id}`,
      )
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.next(false)),
        map((result) => {
          console.log(result);

          return true;
        }),
      );
  }

  ngOnDestroy(): void {
    this.destroy$.next(null);
  }
}
