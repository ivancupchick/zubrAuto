import { Models } from "./Models";
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

  export type Entity = Models.Car & BaseEntity & WithOwnerId;

  export type EntityRequest = RealField.With.Request & BaseEntity;

  export type CreateRequest = EntityRequest & WithOwnerNumber;

  export type UpdateRequest = EntityRequest & WithOwnerId & WithOwnerNumber;

  export type GetResponse = Entity & RealField.With.Response & WithOwnerId & WithOwnerNumber;
}

export namespace ServerCarOwner {
  export type BaseEntity = {
    number: string;
  }

  export type Entity = Models.CarOwner & BaseEntity;

  export type CreateRequest = RealField.With.Request & BaseEntity;

  export type GetResponse = RealField.With.Response & Entity;
}
