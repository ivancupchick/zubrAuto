import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseList } from 'src/app/entities/constants';
import { ZASortDirection } from 'src/app/shared/enums/sort-direction.enum';

@Injectable({
  providedIn: 'root'
})
export abstract class PageagleGridService<ResponseItemType> {
  public abstract list$: Observable<BaseList<ResponseItemType>>;
  public abstract loading$: Observable<boolean>;
  public abstract fetchData(): void;
  public abstract updatePage(payload: { size: number, page: number, sortField?: string, sortOrder?: ZASortDirection, 'deal-status': string[] }): void;
}
