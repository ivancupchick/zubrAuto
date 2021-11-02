import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ServerRole } from 'src/app/entities/role';
import { environment } from 'src/environments/environment';
import { FieldService } from '../field/field.service';
import { RequestService } from '../request/request.service';

const API = 'roles';

@Injectable()
export class RoleService {

  constructor(private requestService: RequestService, private fieldService: FieldService) { }

  getRoles(): Observable<ServerRole.GetResponse[]> {
    return this.requestService.get<ServerRole.GetResponse[]>(`${environment.serverUrl}/${API}`)
  }

  createRole(value: ServerRole.CreateRequest): Observable<boolean> {
    return this.requestService.post<never>(`${environment.serverUrl}/${API}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  getRole(id: number): Observable<ServerRole.GetResponse> {
    return this.requestService.get<ServerRole.GetResponse[]>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return result[0];
      }))
  }

  updateRole(value: ServerRole.Entity | ServerRole.CreateRequest, id: number): Observable<boolean> {
    delete (value as any).id;
    return this.requestService.put<any>(`${environment.serverUrl}/${API}/${id}`, value)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }

  deleteRole(id: number): Observable<boolean> {
    return this.requestService.delete<any>(`${environment.serverUrl}/${API}/${id}`)
      .pipe(map(result => {
        console.log(result);

        return true;
      }))
  }
}
