import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CreateField, Field } from 'src/app/entities/field';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FieldService {

  constructor(private httpClient: HttpClient) { }

  getFields(): Observable<Field[]> {
    return this.httpClient.get<Field[]>(`${environment.serverUrl}/fields`)
  }

  createField(value: CreateField): Observable<boolean> {
    return this.httpClient.post(`${environment.serverUrl}/fields`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getField(id: number): Observable<Field> {
    return this.httpClient.get<Field[]>(`${environment.serverUrl}/fields?fieldId=${id}`)
      .pipe(map(result => {
        console.log(result);

        return result[0];
      }))
  }

  updateField(value: CreateField, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.httpClient.put(`${environment.serverUrl}/fields/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteField(id: number): Observable<boolean> {
    return this.httpClient.delete(`${environment.serverUrl}/fields?fieldId=${id}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }
}
