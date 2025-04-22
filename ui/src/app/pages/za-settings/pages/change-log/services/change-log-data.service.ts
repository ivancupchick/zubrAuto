import {
  DestroyRef,
  inject,
  Injectable,
  OnDestroy,
  signal,
} from '@angular/core';
import { PageagleGridService } from '../../../shared/pageagle-grid/pageagle-grid.service';
import { ChangeLogItem } from '../interfaces/change-log';
import {
  BehaviorSubject,
  Observable,
  Subject,
  finalize,
  takeUntil,
} from 'rxjs';
import { BaseList } from 'src/app/entities/constants';
import { RequestService } from 'src/app/services/request/request.service';
import { environment } from 'src/environments/environment';
import { ZASortDirection } from 'src/app/shared/enums/sort-direction.enum';
import { skipEmptyFilters } from 'src/app/shared/utils/form-filter.util';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const API = 'change-log';

type ChangeLogFilters = {
  [key: string]: number | string;
};

@Injectable({
  providedIn: 'root',
})
export class ChangeLogDataService extends PageagleGridService<ChangeLogItem> {
  loading = signal<boolean>(false);
  list = signal<BaseList<ChangeLogItem>>({
    list: [],
    total: 0,
  });

  private destroyRef = inject(DestroyRef);

  constructor(private requestService: RequestService) {
    super();
  }

  public fetchData() {
    this.loading.set(true);

    this.requestService
      .get<BaseList<ChangeLogItem>>(
        `${environment.serverUrl}/${API}`,
        this.payload,
      )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((res) => {
        this.list.set(res);
      });
  }

  public onFilter(filters: ChangeLogFilters) {
    const payload = {
      size: this.payload.size,
      page: 1,
      ...skipEmptyFilters(filters),
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

  public fetchChangeLogsById(payload: {
    size: number;
    page: number;
    sourceId: number;
    sourceName: string;
  }): Observable<BaseList<ChangeLogItem>> {
    return this.requestService.get<BaseList<ChangeLogItem>>(
      `${environment.serverUrl}/${API}`,
      { ...payload },
    );
  }
}
