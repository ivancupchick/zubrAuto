import { Models } from './Models';

export namespace ServerCallRequest {
  type Entity = Omit<Models.CallRequest, 'id'>;

  export type CreateRequest = Entity;
  export type UpdateRequest = Partial<Entity>;
  export type Response = Models.CallRequest;
  export type IdResponse = Pick<Response, 'id'>;
}
