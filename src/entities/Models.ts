export namespace Models {
  export enum Table {
    Cars = 'cars',
    CarOwners = 'carOwners',
    Clients = 'clients',
    Users = 'users',
    UserTokens = 'userTokens',
    FileChains = 'filesIds',
    Files = 'files',
    FieldChains = 'fieldIds',
    Fields = 'fields',
    Roles = 'roles',
    FieldAccesses = 'fieldAccesses',
    CarForms = 'carForms',
    CarStatistic = 'carStatistic',
    Activities = 'activities',
  }

  export interface Car {
    id: number;
    createdDate: string;
    ownerId: number;
  }

  export interface CarOwner {
    id: number;
    number: string;
  }

  // export const FORMS_TABLE_NAME = 'forms';
  // export interface Form {
  //   id: number;
  //   flags: number;
  // }

  export interface Client {
    id: number;
    carIds: string;
  }

  export interface User {
    id: number;
    email: string; // uniq, required
    password: string; // required
    isActivated: boolean; // default = false
    activationLink?: string;
    roleLevel: number;
  }

  export interface UserToken {
    id: number;
    userId: number; // link to User.id
    refreshToken: string; // required
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
    name: string;
    parent: number;
    fileMetadata: string;
  }

  export interface FieldChain {
    id: number;
    sourceId: number;
    fieldId: number;
    value: string;
    sourceName: string;
  }

  export interface Field {
    id: number;
    name: string;
    flags: number;
    type: number;
    domain: number;
    variants: string;
    showUserLevel: number; // delete
  }


  export interface Role {
    id: number;
    systemName: string;
  }


  export interface FieldAccess {
    id: number;
    fieldId: number;
    sourceId: number;
    sourceName: string;
    access: number;
  }


  export interface CarForm {
    id: number;
    carId: number;
    content: string;
  }


  export interface CarStatistic {
    id: number;
    carId: number;
    content: string;
    type: number;
    date: number;
  }


  export interface Activities {
    id: number;
    userId: number;
    sourceId: number;
    sourceName: string;
    date: number;
    activities: string;
  }
}
