import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FieldDomains, ServerField } from 'src/app/entities/field';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';
import { RequestService } from '../request/request.service';
import { Constants } from 'src/app/entities/constants';

// TODO! delete store variables
// TODO! create base db service

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  private allFields: ServerField.Response[] = [];

  constructor(private requestService: RequestService) { }

  getFields(): Observable<ServerField.Response[]> {
    return this.allFields.length > 0
      ? of(this.allFields)
      : this.requestService.get<ServerField.Response[]>(`${environment.serverUrl}/${Constants.API.FIELDS}/${Constants.API.CRUD}`, {}, true)
        .pipe(
          tap(result => {
            this.allFields = result;
          })
        )
  }

  createField(value: ServerField.CreateRequest): Observable<boolean> {
    return this.requestService.post(`${environment.serverUrl}/${Constants.API.FIELDS}/${Constants.API.CRUD}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getField(id: number): Observable<ServerField.Response> {
    return this.requestService.get<ServerField.Response>(`${environment.serverUrl}/${Constants.API.FIELDS}/${Constants.API.CRUD}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result;
      }))
  }

  updateField(value: ServerField.CreateRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.requestService.put(`${environment.serverUrl}/${Constants.API.FIELDS}/${Constants.API.CRUD}/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteField(id: number): Observable<boolean> {
    return this.requestService.delete(`${environment.serverUrl}/${Constants.API.FIELDS}/${Constants.API.CRUD}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getFieldsByDomain(domain: FieldDomains): Observable<ServerField.Response[]> {
    return this.allFields.length > 0
      ? of(this.allFields.filter(f => `${f.domain}` === `${domain}`))
      : this.requestService.get<ServerField.Response[]>(`${environment.serverUrl}/${Constants.API.FIELDS}/${Constants.API.GET_FIELDS_BY_DOMAIN}/${domain}`, {}, true);
  }
}
