import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CreateField, Domain, Field } from 'src/app/entities/field';
import { environment } from 'src/environments/environment';
import { map, tap } from 'rxjs/operators';

const API = 'fields';

const MAIN_CRUD_API = 'crud';
const GET_FIELDS_BY_DOMAIN = 'getFieldsByDomain';
const ITEM_ID_NAME = 'fieldId';

@Injectable({
  providedIn: 'root'
})
export class FieldService {
  allFields: Field[] = [];

  constructor(private httpClient: HttpClient) { }

  getFields(): Observable<Field[]> {
    return this.httpClient.get<Field[]>(`${environment.serverUrl}/${API}/${MAIN_CRUD_API}`)
      .pipe(
        tap(result => {
          this.allFields = result;
        })
      )
  }

  createField(value: CreateField): Observable<boolean> {
    return this.httpClient.post(`${environment.serverUrl}/${API}/${MAIN_CRUD_API}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getField(id: number): Observable<Field> {
    return this.httpClient.get<Field[]>(`${environment.serverUrl}/${API}/${MAIN_CRUD_API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result[0];
      }))
  }

  updateField(value: CreateField, id: number): Observable<boolean> {
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

  getFieldsByDomain(domain: Domain): Observable<Field[]> {
    return this.allFields.length > 0
      ? of(this.allFields)
      : this.httpClient.get<Field[]>(`${environment.serverUrl}/${API}/${GET_FIELDS_BY_DOMAIN}/${domain}`);
  }
}
