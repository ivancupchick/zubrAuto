import {
  DestroyRef,
  inject,
  Injectable,
  OnDestroy,
  signal,
} from '@angular/core';
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
import { ZASortDirection } from 'src/app/shared/enums/sort-direction.enum';
import { FieldService } from 'src/app/services/field/field.service';
import { FieldDomains } from 'src/app/entities/field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const API = 'cars/crud';

@Injectable({
  providedIn: 'root',
})
export class CarsBaseDataService extends PageagleGridService<ServerCar.Response> {
  loading = signal<boolean>(true);
  list = signal<BaseList<ServerCar.Response>>({
    list: [],
    total: 0,
  });

  public filters$ = new BehaviorSubject<any>({});

  private destroyRef = inject(DestroyRef);

  constructor(
    private requestService: RequestService,
    private fieldService: FieldService,
  ) {
    super();
  }

  public fetchData(): void {
    this.loading.set(true);
    this.requestService
      .get<BaseList<ServerCar.Response>>(
        `${environment.serverUrl}/${API}`,
        this.payload,
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((carsRes) => {
        console.log(carsRes);
        // this.clientCarsSubject.next(carsRes as unknown as ServerCar.Response[]);
        this.list.set({ list: carsRes.list, total: carsRes.total });
        this.loading.set(false);
      });
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
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
        map((result) => {
          console.log(result);

          return true;
        }),
      );
  }

  getCarFields() {
    return this.fieldService.getFieldsByDomain(FieldDomains.Car);
  }

  getCarOwnersFields() {
    return this.fieldService.getFieldsByDomain(FieldDomains.CarOwner);
  }
}
