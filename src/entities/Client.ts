import { CreateEntitiesField, FieldWithValue } from "./Field";

export type ResponseCLient = CreateClientDB & {
  id: number;
  fields: FieldWithValue[];
}

export type RequestCreateClient = CreateClientDB & {
  fields: CreateEntitiesField[];
}

export interface CreateClientDB {
  carIds: string;
}
