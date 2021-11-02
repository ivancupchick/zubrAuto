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
    password: string; // required
    isActivated: boolean; // default = false
    roleLevel?: number
  }

  export type Entity = Models.User & BaseEntity;

  export type CreateRequest = RealField.With.Request & BaseEntity;

  export type GetResponse = RealField.With.Response & Entity;
}

export enum SystemRole {
  None = 0,
  // Editor = 200,
  Admin = 900,
  SuperAdmin = 1000
}
