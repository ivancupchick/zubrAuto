import { Injectable, OnDestroy } from '@angular/core';
import { PageagleGridService } from '../../../shared/pageagle-grid/pageagle-grid.service';
import { BehaviorSubject, Observable, Subject, finalize, map, takeUntil } from 'rxjs';
import { BaseList } from 'src/app/entities/constants';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { ServerClient } from 'src/app/entities/client';
import { FieldNames } from 'src/app/entities/FieldNames';

const API = 'clients';

type ClientBaseFilters = {
  [key: string]: number | string | string[];
};

@Injectable({
  providedIn: 'root'
})
export class ClientBaseService extends PageagleGridService<ServerClient.Response> implements OnDestroy {

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

  public fetchData(): void {
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
  };

  deleteClient(id: number): Observable<boolean> {
    this.loading.next(true);
    return this.requestService.delete<any>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.next(false)),
        map(result => {
        console.log(result);

        return true;
      }))
  };

  
  ngOnDestroy(): void {
    this.destroy$.next(null);
    this.destroy$.complete();
  }
}
