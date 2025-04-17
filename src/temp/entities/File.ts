import { Models } from "./Models";

export namespace ServerFile {
  type Entity = Omit<Models.File, 'id'>;

  export type CreateRequest = Entity;
  export type UpdateRequest = Partial<Entity>;
  export type Response = Models.File;
  export type IdResponse = Pick<Response, 'id'>

  export enum Types {
    Folder,
    File,
    Image,
    Image360,
    StateImage,
  }
}
