import { Models } from "./Models";
import { RealField } from "./Field";

export namespace ServerUser {
  export class Payload {
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

  export type BaseEntity = {
    email: string; // uniq, required
    password: string; // required
    isActivated: boolean; // default = false
    activationLink?: string;
    roleLevel: number
  }

  export type Entity = Models.User & BaseEntity;

  export type CreateRequest = {
    fields: RealField.Request[];
  } & BaseEntity;

  export type GetResponse = {
    fields: RealField.Response[];
  } & Entity;
}

export enum SystemRole {
  // Reader = 100,
  // Editor = 200,
  SuperAdmin = 1000
}
