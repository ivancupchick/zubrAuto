import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Observable, Subject, finalize, takeUntil } from 'rxjs';
import { PageagleGridService } from '../../shared/pageagle-grid/pageagle-grid.service';
import { RequestService } from 'src/app/services/request/request.service';
import { BaseList } from '../../../../../../../src/entities/Types';
import { ServerClient } from '../../../../../../../src/entities/Client';
import { SortDirection } from 'src/app/shared/enums/sort-direction.enum';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';

type SettingsClientsFilters = {
  [key: string]: number | string;
};

@Injectable({
  providedIn: 'root'
})
export class SettingsClientsService extends PageagleGridService<ServerClient.Response> implements OnDestroy {

  destroy$ = new Subject();

  private loading = new BehaviorSubject<boolean>(false);
  public loading$ = this.loading.asObservable();

  private changeLogs = new BehaviorSubject<BaseList<ServerClient.Response>>({ list: [], total: 0 });
  public list$ = this.changeLogs.asObservable();

  constructor(
    private requestService: RequestService
  ){
    super();
  }

  public updatePage(payload: { size: number; page: number; sortField?: string; sortOrder?: SortDirection; }): void {


    this.fetchData();
  }

  public fetchData() {
    this.loading.next(true);
  }

  public onFilter(filters: SettingsClientsFilters) {

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

  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
