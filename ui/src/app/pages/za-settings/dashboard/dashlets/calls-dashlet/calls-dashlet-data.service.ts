import {
  DestroyRef,
  inject,
  Injectable,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  BehaviorSubject,
  finalize,
  mergeMap,
  of,
  Subject,
  takeUntil,
  zip,
} from 'rxjs';
import { ServerClient } from 'src/app/entities/client';
import { BaseList, StringHash } from 'src/app/entities/constants';
import { ServerPhoneCall, Webhook } from 'src/app/entities/phone-calls';
import { ClientService } from 'src/app/services/client/client.service';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { PageagleGridService } from '../../../shared/pageagle-grid/pageagle-grid.service';
import { FieldNames } from 'src/app/entities/FieldNames';
import { ZASortDirection } from 'src/app/shared/enums/sort-direction.enum';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type CallDashletFilters = {
  [key: string]: number | string;
};

@Injectable({
  providedIn: 'root',
})
export class CallsDashletDataService extends PageagleGridService<ServerPhoneCall.Response> {
  loading = signal<boolean>(false);
  list = signal<BaseList<ServerPhoneCall.Response>>({
    list: [],
    total: 0,
  });

  private clientsSubject = new BehaviorSubject<BaseList<ServerClient.Response>>(
    { list: [], total: 0 },
  );
  public clients$ = this.clientsSubject.asObservable();

  ready = false;

  private destroyRef = inject(DestroyRef);
  private clientService = inject(ClientService);
  private requestService = inject(RequestService);

  public fetchData() {
    if (!this.ready) {
      return;
    }
    this.loading.set(true);

    this.requestService
      .get<BaseList<ServerPhoneCall.Response>>(
        `${environment.serverUrl}/${'phone-call'}`,
        this.payload,
      ) //
      .pipe(
        mergeMap((callsRes) => {
          const numbers = callsRes.list.map((call) => `+${call.clientNumber}`);

          const query: StringHash<string[]> = {
            [FieldNames.Client.number]: numbers,
          };

          return zip(
            of(callsRes),
            numbers.length
              ? this.clientService.getClientsByNumber(query)
              : of({ list: [], total: 0 }),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe(([callsRes, clientRes]) => {
        this.clientsSubject.next(clientRes);
        this.list.set(callsRes);
      });
  }

  public onFilter(callDashletFilters: CallDashletFilters) {
    const payload = {
      size: this.payload.size,
      page: 1,
      ...(callDashletFilters as any),
    };

    if (this.payload.sortField && this.payload.sortOrder) {
      [payload.sortField, payload.sortOrder] = [
        this.payload.sortField,
        this.payload.sortOrder,
      ];
    }

    this.payload = payload;

    this.fetchData();
  }
}
