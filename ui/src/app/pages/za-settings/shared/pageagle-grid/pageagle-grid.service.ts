import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { BaseList } from 'src/app/entities/constants';

@Injectable({
  providedIn: 'root'
})
export abstract class PageagleGridService<ResponseItemType> {
  public abstract list$: Observable<BaseList<ResponseItemType>>;
  public abstract loading$: Observable<boolean>;
  public abstract fetchData(): void;
  public abstract updatePage(payload: { size: number, page: number }): void;
}
