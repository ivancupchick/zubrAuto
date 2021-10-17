export namespace Database {
  export interface Car {
    id: number;
    createdDate: string;
    ownerId: number;
  }

  export interface CarOwner {
    id: number;
    number: string;
  }

  export interface Form {
    id: number;
    flags: number;
  }

  export const CLIENTS_TABLE_NAME = 'public.clients';
  export interface Client {
    id: number;
    carIds: string;
  }

  export interface User {
    id: number;
    roleLevel: number;
  }

  export interface FileChain {
    id: number;
    sourceId: number;
    fileId: number;
    sourceName: string;
  }

  export interface File {
    id: number;
    url: string;
    type: number;
  }

  export const FIELD_CHAINS_TABLE_NAME = 'public.fieldsIds'
  export interface FieldChain {
    id: number;
    sourceId: number;
    fieldId: number;
    value: string;
    sourceName: string;
  }

  export const FIELDS_TABLE_NAME = 'public.fields';
  export interface Field {
    id: number;
    name: string;
    flags: number;
    type: number;
    domain: number;
    variants: string;
    showUserLevel: number;
  }
}
