import { Injectable, OnDestroy } from '@angular/core';
import { PageagleGridService } from '../../../shared/pageagle-grid/pageagle-grid.service';
import { ChangeLogItem } from '../interfaces/change-log';
import { BehaviorSubject, Observable, Subject, finalize, takeUntil } from 'rxjs';
import { BDModels, BaseList, StringHash } from 'src/app/entities/constants';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { ServerClient } from 'src/app/entities/client';

const API = 'change-log';

type Filters = {
  [key: string]: number | string;
};

@Injectable({
  providedIn: 'root'
})
export class ChangeLogDataService extends PageagleGridService<ChangeLogItem> implements OnDestroy {
  private loading = new BehaviorSubject<boolean>(false);
  public loading$ = this.loading.asObservable();

  private changeLogs = new BehaviorSubject<BaseList<ChangeLogItem>>({ list: [], total: 0 });
  public list$ = this.changeLogs.asObservable();

  private payload: Filters = {
    page: 10,
    size: 10
  };

  private destroy$ = new Subject();

  constructor(private requestService: RequestService) {
    super()
  }

  public fetchData() {
    this.loading.next(true);

    this.requestService.get<BaseList<ChangeLogItem>>(`${environment.serverUrl}/${API}`, Object.assign({ ...this.payload }, { sourceName: 'clients' }))
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.next(false))
      )
      .subscribe((res) => {
        this.changeLogs.next(res);

      });
  }

  public updatePage(payload: { size: number; page: number; }) {
    [
      this.payload.size,
      this.payload.page
    ] = [
      payload.size,
      payload.page
    ];

    this.fetchData();
  }

  public onFilter(filters: Filters) {
    this.payload = {
      size: this.payload.size,
      page: 1,
      ...filters
    };
    this.fetchData();
  }

  public fetchChangeLogsById(payload: { size: number; page: number; sourceId: number, sourceName: string }): Observable<BaseList<ChangeLogItem>> {
    return this.requestService.get<BaseList<ChangeLogItem>>(`${environment.serverUrl}/${API}`, {...payload })
  }

  ngOnDestroy(): void {
    this.destroy$.next(null)
  }
}
