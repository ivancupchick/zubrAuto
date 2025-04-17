import { Models } from "./Models";
export declare namespace ServerFile {
    type Entity = Omit<Models.File, 'id'>;
    export type CreateRequest = Entity;
    export type UpdateRequest = Partial<Entity>;
    export type Response = Models.File;
    export type IdResponse = Pick<Response, 'id'>;
    export enum Types {
        Folder = 0,
        File = 1,
        Image = 2,
        Image360 = 3,
        StateImage = 4
    }
    export {};
}
