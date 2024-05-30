import { Models } from "./Models";

export namespace ServerActivity {
  type Entity = Omit<Models.Activity, 'id'>;

  export type CreateRequest = Entity;
  export type UpdateRequest = Partial<Entity>;
  export type Response = Models.Activity;
  export type IdResponse = Pick<Response, 'id'>
}
