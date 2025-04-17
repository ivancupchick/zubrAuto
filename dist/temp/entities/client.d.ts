import { Models } from "./Models";
import { RealField } from "./Field";
export declare namespace ServerClient {
    type Entity = Omit<Models.Client, 'id'>;
    export type CreateRequest = RealField.With.Request & Entity;
    export type UpdateRequest = RealField.With.Request & Partial<Entity>;
    export type Response = Models.Client & RealField.With.Response;
    export type IdResponse = Pick<Response, 'id'>;
    export {};
}
