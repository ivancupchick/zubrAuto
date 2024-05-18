import { Models } from "./Models";
import { RealField } from "./Field";
export namespace ServerCar {
  type WithOwnerNumber = {
    ownerNumber: string;
  }

  export type CreateRequest = RealField.With.Request & WithOwnerNumber;
  export type UpdateRequest = RealField.With.Request & Partial<WithOwnerNumber>;
  export type Response = Models.Car & RealField.With.Response & WithOwnerNumber;
  export type IdResponse = Pick<Response, 'id'>

  export type CreateByLink = {
    link: string;
    userId: number;
  }

  export type CreateByManager = {
    cars: string[];
    specialist: number;
  }
}

export namespace ServerCarImage {
  type Entity = {
    file: File;
    metadata: string;
  }

  export type CreateRequest = Entity;
  export type UpdateRequest = Partial<Entity>;
  export type Response = Models.File & Entity;
  export type IdResponse = Pick<Response, 'id'>
}
