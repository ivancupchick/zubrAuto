import { Database } from "./Database";
import { RealField } from "./Field";

export namespace ServerClient {
  export type BaseEntity = {
    carIds: string;
  }

  export type Entity = Database.Client & BaseEntity;

  export type CreateRequest = {
    fields: RealField.Request[];
  } & BaseEntity;

  export type GetResponse = {
    fields: RealField.Response[];
  } & Entity;
}
