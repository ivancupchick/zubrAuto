import { inject, Injectable, OnDestroy } from '@angular/core';
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

type CallDashletFilters = {
  [key: string]: number | string;
};

@Injectable()
export class CallsDashletDataService
  extends PageagleGridService<ServerPhoneCall.Response>
  implements OnDestroy
{
  private loading = new BehaviorSubject<boolean>(false);
  public loading$ = this.loading.asObservable();

  private calls = new BehaviorSubject<BaseList<ServerPhoneCall.Response>>({
    list: [],
    total: 0,
  });
  public list$ = this.calls.asObservable();

  private clientsSubject = new BehaviorSubject<BaseList<ServerClient.Response>>(
    { list: [], total: 0 },
  );
  public clients$ = this.clientsSubject.asObservable();

  ready = false;

  private destroy$ = new Subject();
  private clientService = inject(ClientService);
  private requestService = inject(RequestService);

  public fetchData() {
    if (!this.ready) {
      return;
    }
    this.loading.next(true);

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
        takeUntil(this.destroy$),
        finalize(() => this.loading.next(false)),
      )
      .subscribe(([callsRes, clientRes]) => {
        this.clientsSubject.next(clientRes);
        this.calls.next(callsRes);
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

  ngOnDestroy(): void {
    this.destroy$.next(null);
  }
}
