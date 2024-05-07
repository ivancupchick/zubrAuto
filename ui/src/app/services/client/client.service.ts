import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerClient } from 'src/app/entities/client';
import { Constants, StringHash } from 'src/app/entities/constants';
import { FieldDomains } from 'src/app/entities/field';
import { environment } from 'src/environments/environment';
import { FieldService } from '../field/field.service';
import { RequestService } from '../request/request.service';

const API = 'clients';
// const ITEM_ID_NAME = 'clientId'

@Injectable()
export class ClientService {

  constructor(private requestService: RequestService, private fieldService: FieldService) { }
  getClients(): Observable<ServerClient.Response[]> {
    return this.requestService.get<ServerClient.Response[]>(`${environment.serverUrl}/${API}`);
  }

  getClientsByQuery(query: StringHash): Observable<ServerClient.Response[]> {
    const queries = Object.keys(query).filter(key => !!query[key]).map(key => `${key}=${query[key]}`).join('&');

    return this.requestService.get<ServerClient.Response[]>(`${environment.serverUrl}/${API}?${queries}`)
  }

  // Геттер для клиентов
  get clients$(): Observable<ServerClient.Response[]> {
    return this.getClients();
  }

  createClient(value: ServerClient.CreateRequest): Observable<boolean> {
    return this.requestService.post<never>(`${environment.serverUrl}/${API}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getClient(id: number): Observable<ServerClient.Response> {
    return this.requestService.get<ServerClient.Response[]>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result[0];
      }))
  }

  updateClient(value: ServerClient.UpdateRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.requestService.put<any>(`${environment.serverUrl}/${API}/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteClient(id: number): Observable<boolean> {
    return this.requestService.delete<any>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  completeDeal(clientId: number, carId: number | string): Observable<boolean> {
    if (typeof clientId === 'string') {
      return of(false);
    }
    return this.requestService.post<any>(`${environment.serverUrl}/${API}/${Constants.API.COMPLETE_DEAL}`, { clientId, carId })
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getClientFields() {
    return this.fieldService.getFieldsByDomain(FieldDomains.Client);
  }

  getClientsByNumber(payloud: StringHash): Observable<ServerClient.Response[]> {
    return this.requestService.get<ServerClient.Response[]>(`${environment.serverUrl}/${API}`, payloud)
      .pipe(map(result => {
        return result;
      }))
  }
}
