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

  export interface Client {
    id: number;
    carIds: string;
  }

  export interface User {
    id: number;
    roleLevel: number;
  }

  export interface FileId {
    id: number;
    sourceId: number;
    fileId: number;
  }

  export interface File {
    id: number;
    url: string;
    type: number;
  }

  export interface FieldId {
    id: number;
    sourceId: number;
    fieldId: number;
    value: string;
  }

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
