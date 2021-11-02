import { Models } from "./Models";
import { RealField } from "./Field";

export namespace ServerUser {
  // TODO! replace to ServerAuth
  export class Payload implements IPayload{
    public id: number;
    public email: string;
    public isActivated: boolean;
    public roleLevel: number;

    constructor(options: Models.User) {
      this.id = options.id;
      this.email = options.email;
      this.isActivated = options.isActivated;
      this.roleLevel = options.roleLevel;
    }
  }

  export interface IPayload {
    id: number;
    email: string;
    isActivated: boolean;
    roleLevel: number;
  }

  export interface AuthGetResponse {
    user: IPayload,
    accessToken: string,
    refreshToken: string
  }
  // end

  export type BaseEntity = {
    email: string; // uniq, required
    isActivated: boolean; // default = false
    roleLevel?: number
  }

  type WithPass = {
    password: string;
  }

  type WithPassNotReq = {
    password?: string;
  }

  export type Entity = Models.User & BaseEntity & WithPass;

  export type CreateRequest = RealField.With.Request & BaseEntity & WithPass;
  export type UpdateRequest = RealField.With.Request & BaseEntity & WithPassNotReq;

  export type GetResponse = RealField.With.Response & IPayload;
}

export enum SystemRole {
  None = 0,
  // Editor = 200,
  Admin = 900,
  SuperAdmin = 1000
}
