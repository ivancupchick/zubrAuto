import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { BaseList, Constants } from 'src/app/entities/constants';
import { FieldDomains } from 'src/app/entities/field';
import { ServerUser } from 'src/app/entities/user';
import { environment } from 'src/environments/environment';
import { FieldService } from '../field/field.service';
import { RequestService } from '../request/request.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private requestService: RequestService,
    private fieldService: FieldService,
  ) {}

  getUsers(
    isCachableRequest = false,
  ): Observable<BaseList<ServerUser.Response>> {
    return this.requestService.get<BaseList<ServerUser.Response>>(
      `${environment.serverUrl}/${Constants.API.USERS}/${Constants.API.CRUD}`,
      { deleted: false },
      isCachableRequest,
    );
  }

  getAllUsers(
    isCachableRequest = false,
  ): Observable<BaseList<ServerUser.Response>> {
    return this.requestService.get<BaseList<ServerUser.Response>>(
      `${environment.serverUrl}/${Constants.API.USERS}/${Constants.API.CRUD}`,
      {},
      isCachableRequest,
    );
  }

  createUser(value: ServerUser.CreateRequest): Observable<boolean> {
    return this.requestService
      .post<never>(
        `${environment.serverUrl}/${Constants.API.USERS}/${Constants.API.CRUD}`,
        value,
      )
      .pipe(
        map((result) => {
          console.log(result);

          return true;
        }),
      );
  }

  getUser(id: number): Observable<ServerUser.Response> {
    return this.requestService
      .get<ServerUser.Response>(
        `${environment.serverUrl}/${Constants.API.USERS}/${Constants.API.CRUD}/${id}`,
      )
      .pipe(
        map((result) => {
          console.log(result);

          return result;
        }),
      );
  }

  updateUser(value: ServerUser.UpdateRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.requestService
      .put<any>(
        `${environment.serverUrl}/${Constants.API.USERS}/${Constants.API.CRUD}/${id}`,
        value,
      )
      .pipe(
        map((result) => {
          console.log(result);

          return true;
        }),
      );
  }

  deleteUser(id: number): Observable<boolean> {
    return this.requestService
      .delete<any>(
        `${environment.serverUrl}/${Constants.API.USERS}/${Constants.API.CRUD}/${id}`,
      )
      .pipe(
        map((result) => {
          console.log(result);

          return true;
        }),
      );
  }

  getUserFields() {
    return this.fieldService.getFieldsByDomain(FieldDomains.User);
  }
}
