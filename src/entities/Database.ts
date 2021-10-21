export namespace Database {

  export const CARS_TABLE_NAME = 'public.cars';
  export interface Car {
    id: number;
    createdDate: string;
    ownerId: number;
  }

  export const CAR_OWNERS_TABLE_NAME = 'public.carOwners';
  export interface CarOwner {
    id: number;
    number: string;
  }

  // export const FORMS_TABLE_NAME = 'public.forms';
  // export interface Form {
  //   id: number;
  //   flags: number;
  // }

  export const CLIENTS_TABLE_NAME = 'public.clients';
  export interface Client {
    id: number;
    carIds: string;
  }

  // export const USERS_TABLE_NAME = 'users';
  // export interface User {
  //   id: number;
  //   roleLevel: number;
  // }

  // export const FILE_CHAINS_TABLE_NAME = 'filesIds';
  // export interface FileChain {
  //   id: number;
  //   sourceId: number;
  //   fileId: number;
  //   sourceName: string;
  // }

  // export const FILES_TABLE_NAME = 'public.files';
  // export interface File {
  //   id: number;
  //   url: string;
  //   type: number;
  // }

  export const FIELD_CHAINS_TABLE_NAME = 'public.fieldIds';
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
