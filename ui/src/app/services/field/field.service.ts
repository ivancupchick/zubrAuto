import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Domain, ServerField } from 'src/app/entities/field';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';

// TODO! delete store variables
// TODO! create base db service

const API = 'fields';

const MAIN_CRUD_API = 'crud';
const GET_FIELDS_BY_DOMAIN = 'getFieldsByDomain';

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  allFields: ServerField.Entity[] = [];

  constructor(private httpClient: HttpClient) { }

  getFields(): Observable<ServerField.Entity[]> {
    return this.httpClient.get<ServerField.Entity[]>(`${environment.serverUrl}/${API}/${MAIN_CRUD_API}`)
      .pipe(
        tap(result => {
          this.allFields = result;
        })
      )
  }

  createField(value: ServerField.CreateRequest): Observable<boolean> {
    return this.httpClient.post(`${environment.serverUrl}/${API}/${MAIN_CRUD_API}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getField(id: number): Observable<ServerField.Entity> {
    return this.httpClient.get<ServerField.Entity[]>(`${environment.serverUrl}/${API}/${MAIN_CRUD_API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result[0];
      }))
  }

  updateField(value: ServerField.CreateRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.httpClient.put(`${environment.serverUrl}/${API}/${MAIN_CRUD_API}/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteField(id: number): Observable<boolean> {
    return this.httpClient.delete(`${environment.serverUrl}/${API}/${MAIN_CRUD_API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getFieldsByDomain(domain: Domain): Observable<ServerField.Entity[]> {
    return this.allFields.length > 0
      ? of(this.allFields.filter(f => `${f.domain}` === `${domain}`))
      : this.httpClient.get<ServerField.Entity[]>(`${environment.serverUrl}/${API}/${GET_FIELDS_BY_DOMAIN}/${domain}`);
  }
}
