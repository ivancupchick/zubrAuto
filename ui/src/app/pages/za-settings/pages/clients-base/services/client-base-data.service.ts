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
import { BaseList, StringHash } from 'src/app/entities/constants';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { ServerClient } from 'src/app/entities/client';
import { ServerCar } from 'src/app/entities/car';
import { CarService } from 'src/app/services/car/car.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const API = 'clients';

type ClientBaseFilters = {
  [key: string]: number | string | string[];
};

@Injectable({
  providedIn: 'root',
})
export class ClientBaseDataService extends PageagleGridService<ServerClient.Response> {
  loading = signal<boolean>(true);

  list = signal<BaseList<ServerClient.Response>>({ list: [], total: 0 });

  private clientCarsSubject = new BehaviorSubject<ServerCar.Response[]>([]);
  public clientCars$ = this.clientCarsSubject.asObservable();

  private destroyRef = inject(DestroyRef);
  private carService = inject(CarService);

  constructor(private requestService: RequestService) {
    super();
  }

  public fetchData(): void {
    this.loading.set(true);
    this.requestService
      .get<BaseList<ServerClient.Response>>(
        `${environment.serverUrl}/${API}`,
        this.payload,
      )
      .pipe(
        mergeMap((clientRes) => {
          const carIds = clientRes.list
            .reduce<number[]>((prev, client) => {
              const clietnCarIds = client.carIds.split(',').map((id) => +id);
              return [...prev, ...clietnCarIds];
            }, [])
            .filter((id) => id && !Number.isNaN(id));

          if (carIds.length === 0) {
            return zip(
              of(clientRes),
              of({
                list: [],
                total: 0,
              } satisfies BaseList<ServerCar.Response>),
            );
          }

          const query: StringHash = { id: [...new Set(carIds)].join(',') };

          return zip(of(clientRes), this.carService.getCarsByQuery(query));
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(([clientRes, carsRes]) => {
        this.list.set(clientRes);
        this.clientCarsSubject.next(carsRes?.list || []);
      });
  }

  getClients(): Observable<BaseList<ServerClient.Response>> {
    return this.requestService.get<BaseList<ServerClient.Response>>(
      `${environment.serverUrl}/${API}`,
    );
  }

  deleteClient(id: number): Observable<boolean> {
    this.loading.set(true);
    return this.requestService
      .delete<any>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
        map((result) => {
          console.log(result);

          return true;
        }),
      );
  }
}
