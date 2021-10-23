import { Models } from "./Models";
import { RealField } from "./Field";

export namespace ServerClient {
  export type BaseEntity = {
    carIds: string;
  }

  export type Entity = Models.Client & BaseEntity;

  export type CreateRequest = {
    fields: RealField.Request[];
  } & BaseEntity;

  export type GetResponse = {
    fields: RealField.Response[];
  } & Entity;
}
