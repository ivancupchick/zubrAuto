import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { StringHash } from 'src/app/entities/constants';

@Injectable()
export class RequestService {

  constructor(private httpClient: HttpClient) {}

  get<T>(url: string, params: StringHash<string | number> = {}) {
    return this.httpClient.get<T>(url, { params: { ...params} }).pipe( take(1) );
  }

  post<T, T2 = any>(url: string, body: T2) {
    return this.httpClient.post<T>(url, body).pipe( take(1) );
  }

  put<T, T2 = any>(url: string, body: T2) {
    return this.httpClient.put<T>(url, body).pipe( take(1) );
  }

  delete<T>(url: string) {
    return this.httpClient.delete<T>(url).pipe( take(1) );
  }
}
