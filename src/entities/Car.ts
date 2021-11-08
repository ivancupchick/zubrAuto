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
}
