import { Database } from "./Database";
import { RealField } from "./Field";


export namespace ServerCar {
  export type BaseEntity = {
    createdDate: string;
  }

  export type WithOwnerId = {
    ownerId: number;
  }

  export type WithOwnerNumber = {
    ownerNumber: string;
  }

  export type Entity = Database.Car & BaseEntity & WithOwnerId;

  export type CreateRequest = {
    fields: RealField.Request[];
  } & BaseEntity & WithOwnerNumber;

  export type UpdateRequest = {
    fields: RealField.Request[];
  } & BaseEntity & WithOwnerId;

  export type GetResponse = {
    fields: RealField.Response[];
    ownerNumber: string;
  } & Entity;
}

export namespace ServerCarOwner {
  export type BaseEntity = {
    number: string;
  }

  export type Entity = Database.CarOwner & BaseEntity;

  export type CreateRequest = {
    fields: RealField.Request[];
  } & BaseEntity;

  export type GetResponse = {
    fields: RealField.Response[];
  } & Entity;
}
