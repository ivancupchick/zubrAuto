import { Models } from "./Models";
import { RealField } from "./Field";
import { RequireAtLeastOne } from "./Types";

export namespace ServerUser {
  export type CreateRequest = RealField.With.Request & Omit<Models.User, 'id' | 'activationLink'>;
  export type UpdateRequest = RequireAtLeastOne<CreateRequest>;
  export type Response = RealField.With.Response & Omit<Models.User, 'password' | 'activationLink'>;
  export type IdResponse = Pick<Response, 'id'>;
}
