import { Injectable, OnDestroy } from '@angular/core';
import { PageagleGridService } from '../../../shared/pageagle-grid/pageagle-grid.service';
import { BehaviorSubject, Observable, Subject, finalize, takeUntil } from 'rxjs';
import { BaseList } from 'src/app/entities/constants';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { ServerClient } from 'src/app/entities/client';
import { ServerField } from 'src/app/entities/field';
import { ServerUser } from 'src/app/entities/user';
import { FieldNames } from 'src/app/entities/FieldNames';

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

  private loading = new BehaviorSubject<boolean>(true);
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
  ) { super() }

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

  public updatePage(filters: ClientBaseFilters): void {
    const payload: any = {
      size: this.payload.size,
      page: 1,
      'deal-status': [FieldNames.DealStatus.InProgress, FieldNames.DealStatus.OnDeposit], // подгрузка фильтров по умолчанию
      ...skipEmptyFilters(filters),
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
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
