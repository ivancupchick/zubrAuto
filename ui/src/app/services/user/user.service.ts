import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Domain } from 'src/app/entities/field';
import { ServerUser } from 'src/app/entities/user';
import { environment } from 'src/environments/environment';
import { FieldService } from '../field/field.service';
import { RequestService } from '../request/request.service';

const API = 'users';

@Injectable()
export class UserService {

  constructor(private requestService: RequestService, private fieldService: FieldService) { }

  getUsers(): Observable<ServerUser.GetResponse[]> {
    return this.requestService.get<ServerUser.GetResponse[]>(`${environment.serverUrl}/${API}`)
  }

  createUser(value: ServerUser.CreateRequest): Observable<boolean> {
    return this.requestService.post<never>(`${environment.serverUrl}/${API}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getUser(id: number): Observable<ServerUser.GetResponse> {
    return this.requestService.get<ServerUser.GetResponse[]>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result[0];
      }))
  }

  updateUser(value: ServerUser.Entity | ServerUser.CreateRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.requestService.put<any>(`${environment.serverUrl}/${API}/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteUser(id: number): Observable<boolean> {
    return this.requestService.delete<any>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getUserFields() {
    return this.fieldService.getFieldsByDomain(Domain.User);
  }
}
