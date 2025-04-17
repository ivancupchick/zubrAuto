import { Models } from "./Models";
export declare namespace ServerPhoneCall {
    type Entity = Omit<Models.PhoneCall, 'id'>;
    export type CreateRequest = Entity;
    export type UpdateRequest = Partial<Entity>;
    export type Response = Models.PhoneCall;
    export type IdResponse = Pick<Response, 'id'>;
    export {};
}
