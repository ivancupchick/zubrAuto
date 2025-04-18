import { Injectable, OnDestroy } from '@angular/core';
import { PageagleGridService } from '../../../shared/pageagle-grid/pageagle-grid.service';
import { ChangeLogItem } from '../interfaces/change-log';
import { BehaviorSubject, Observable, Subject, finalize, takeUntil } from 'rxjs';
import { BaseList } from 'src/app/entities/constants';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { ZASortDirection } from 'src/app/shared/enums/sort-direction.enum';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';

const API = 'change-log';

type ChangeLogFilters = {
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

  private payload: ChangeLogFilters = {
    page: 1,
    size: 10
  };

  private destroy$ = new Subject();

  constructor(private requestService: RequestService) {
    super()
  }

  public fetchData() {
    this.loading.next(true);

    this.requestService.get<BaseList<ChangeLogItem>>(`${environment.serverUrl}/${API}`, this.payload)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.next(false))
      )
      .subscribe((res) => {
        this.changeLogs.next(res);

      });
  }

  public updatePage(payload: { size: number; page: number; sortField?: string; sortOrder?: ZASortDirection; }): void {
    [
      this.payload.size,
      this.payload.page
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

  public onFilter(filters: ChangeLogFilters) {
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

  public fetchChangeLogsById(payload: { size: number; page: number; sourceId: number, sourceName: string }): Observable<BaseList<ChangeLogItem>> {
    return this.requestService.get<BaseList<ChangeLogItem>>(`${environment.serverUrl}/${API}`, {...payload })
  }

  ngOnDestroy(): void {
    this.destroy$.next(null)
  }
}
