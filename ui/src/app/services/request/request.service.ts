import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, take, tap } from 'rxjs/operators';
import { StringHash } from 'src/app/entities/constants';
import { RequestType, ZAResponose, cacheService } from './cache.service';
import { Observable, Subject, of, throwError } from 'rxjs';

@Injectable()
export class RequestService {

  constructor(private httpClient: HttpClient) {}

  get<T>(url: string, params: StringHash<string | number | string[] | boolean> = {}, isCachableRequest: boolean = false) {
    return this.baseRequest(
      this.httpClient.get<T>(url, { params }),
      url,
      RequestType.Get,
      params,
      isCachableRequest
    );
  }

  post<T, T2 = any>(url: string, body: T2, isCachableRequest: boolean = false) {
    return this.baseRequest(
      this.httpClient.post<T>(url, body),
      url,
      RequestType.Post,
      body,
      isCachableRequest
    );
  }

  put<T, T2 = any>(url: string, body: T2, isCachableRequest: boolean = false) {
    return this.baseRequest(
      this.httpClient.put<T>(url, body),
      url,
      RequestType.Put,
      body,
      isCachableRequest
    );
  }

  delete<T>(url: string, isCachableRequest: boolean = false) {
    return this.baseRequest(
      this.httpClient.delete<T>(url),
      url,
      RequestType.Delete,
      {},
      isCachableRequest
    );
  }

  private baseRequest<T>(obs: Observable<T>, url: string, type: RequestType, body: any, isCachableRequest = false): Observable<T> {
    if (isCachableRequest) {
      const cachedRequest = cacheService.get(url, type, body);
      if (cachedRequest instanceof Subject) {
        return cachedRequest.asObservable().pipe(take(1));
      }
      if (cachedRequest) {
        return of(cachedRequest);
      }

      cacheService.put(url, type, body, new Subject());
    }

    return obs
      .pipe(
        take(1),
        tap(response => {
          this.fireCachedSubject(url, type, body, response, isCachableRequest);
        }),
        catchError((catchResult) => {
          // console.error(catchResult);
          this.fireCachedSubject(url, type, body, {}, isCachableRequest);
          throw catchResult;
        }),
      );
  }

  private fireCachedSubject(url: string, type: RequestType, body: any, response: ZAResponose, isCachableRequest: boolean) {
    if (isCachableRequest) {
      const prevValue = cacheService.get(url, type, body);
      if (prevValue && prevValue instanceof Subject) {
        // console.log('next');
        prevValue.next(response);
      }
      cacheService.put(url, type, body, response);
    }
  }
}
