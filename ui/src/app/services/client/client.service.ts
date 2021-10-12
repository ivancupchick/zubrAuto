import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { CreateClientRequest, DBClient } from 'src/app/entities/client';
import { Domain, Field } from 'src/app/entities/field';
import { environment } from 'src/environments/environment';
import { FieldService } from '../field/field.service';

const API = 'clients';
// const ITEM_ID_NAME = 'clientId'

@Injectable()
export class ClientService {

  constructor(private httpClient: HttpClient, private fieldService: FieldService) { }

  getClients(): Observable<DBClient[]> {
    return this.httpClient.get<DBClient[]>(`${environment.serverUrl}/${API}`)
  }

  createClient(value: CreateClientRequest): Observable<boolean> {
    return this.httpClient.post(`${environment.serverUrl}/${API}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getClient(id: number): Observable<DBClient> {
    return this.httpClient.get<DBClient[]>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result[0];
      }))
  }

  updateClient(value: CreateClientRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.httpClient.put(`${environment.serverUrl}/${API}/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteClient(id: number): Observable<boolean> {
    return this.httpClient.delete(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getClientFields(): Observable<Field[]> {
    return this.fieldService.getFieldsByDomain(Domain.Client);
  }
}
