import { FieldWithValue } from "./Field";

export type ResponseCLient = RequestCreateClient & {
  id: number;

}

export type RequestCreateClient = CreateClientDB & {
  fields: (FieldWithValue | { value: string, id: number })[];
}

export interface CreateClientDB {
  carIds: string;
}
