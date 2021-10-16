import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerClient } from 'src/app/entities/client';
import { Domain, ServerField } from 'src/app/entities/field';
import { environment } from 'src/environments/environment';
import { FieldService } from '../field/field.service';

const API = 'clients';
// const ITEM_ID_NAME = 'clientId'

@Injectable()
export class ClientService {

  constructor(private httpClient: HttpClient, private fieldService: FieldService) { }

  getClients(): Observable<ServerClient.GetResponse[]> {
    return this.httpClient.get<ServerClient.GetResponse[]>(`${environment.serverUrl}/${API}`)
  }

  createClient(value: ServerClient.CreateRequest): Observable<boolean> {
    return this.httpClient.post<any>(`${environment.serverUrl}/${API}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getClient(id: number): Observable<ServerClient.GetResponse> {
    return this.httpClient.get<ServerClient.GetResponse[]>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result[0];
      }))
  }

  updateClient(value: ServerClient.Entity | ServerClient.CreateRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.httpClient.put<any>(`${environment.serverUrl}/${API}/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteClient(id: number): Observable<boolean> {
    return this.httpClient.delete<any>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getClientFields(): Observable<ServerField.Entity[]> {
    return this.fieldService.getFieldsByDomain(Domain.Client);
  }
}
