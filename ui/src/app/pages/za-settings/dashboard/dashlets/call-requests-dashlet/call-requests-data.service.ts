import { DestroyRef, inject, Injectable, signal } from '@angular/core';
import { PageagleGridService } from '../../../shared/pageagle-grid/pageagle-grid.service';
import { BehaviorSubject, finalize, mergeMap, of, zip } from 'rxjs';
import { ServerCallRequest } from 'src/app/entities/call-request';
import { BaseList, StringHash } from 'src/app/entities/constants';
import { ServerClient } from 'src/app/entities/client';
import { ClientService } from 'src/app/services/client/client.service';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { FieldNames } from 'src/app/entities/FieldNames';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

type CallRequestsFilters = {
  [key: string]: number | string;
};

@Injectable({
  providedIn: 'root',
})
export class CallRequestsDataService extends PageagleGridService<ServerCallRequest.Response> {
  loading = signal<boolean>(false);
  list = signal<BaseList<ServerCallRequest.Response>>({
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
    this.loading.set(true);

    this.requestService
      .get<BaseList<ServerCallRequest.Response>>(
        `${environment.serverUrl}/${'call-requests'}`,
        this.payload,
      ) //
      .pipe(
        mergeMap((callsRes) => {
          const numbers = callsRes.list.map(
            (callRequest) => callRequest.clientNumber,
          );

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

  public onFilter(callDashletFilters: CallRequestsFilters) {
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
