export namespace Models {

  export const CARS_TABLE_NAME = 'cars';
  export interface Car {
    id: number;
    createdDate: string;
    ownerId: number;
  }

  export const CAR_OWNERS_TABLE_NAME = 'carOwners';
  export interface CarOwner {
    id: number;
    number: string;
  }

  // export const FORMS_TABLE_NAME = 'forms';
  // export interface Form {
  //   id: number;
  //   flags: number;
  // }

  export const CLIENTS_TABLE_NAME = 'clients';
  export interface Client {
    id: number;
    carIds: string;
  }

  export const USERS_TABLE_NAME = 'users';
  export interface User {
    id: number;
    email: string; // uniq, required
    password: string; // required
    isActivated: boolean; // default = false
    activationLink?: string;
    roleLevel: number;
  }

  export const USER_TOKENS_TABLE_NAME = 'userTokens';
  export interface UserToken {
    id: number;
    userId: number; // link to User.id
    refreshToken: string; // required
  }

  export const FILE_CHAINS_TABLE_NAME = 'filesIds';
  export interface FileChain {
    id: number;
    sourceId: number;
    fileId: number;
    sourceName: string;
  }

  export const FILES_TABLE_NAME = 'files';
  export interface File {
    id: number;
    url: string;
    type: number;
    name: string;
    parent: number;
    fileMetadata: string;
  }

  export const FIELD_CHAINS_TABLE_NAME = 'fieldIds';
  export interface FieldChain {
    id: number;
    sourceId: number;
    fieldId: number;
    value: string;
    sourceName: string;
  }

  export const FIELDS_TABLE_NAME = 'fields';
  export interface Field {
    id: number;
    name: string;
    flags: number;
    type: number;
    domain: number;
    variants: string;
    showUserLevel: number; // delete
  }

  export const ROLES_TABLE_NAME = 'roles';
  export interface Role {
    id: number;
    systemName: string;
  }

  export const FIELD_ACCESSES_TABLE_NAME = 'fieldAccesses';
  export interface FieldAccess {
    id: number;
    fieldId: number;
    sourceId: number;
    sourceName: string;
    access: number;
  }

  export const CAR_FORMS_TABLE_NAME = 'carQuestionnaires';
  export interface CarQuestionnaire {
    id: number;
    carId: number;
    content: string;
  }

  export const CAR_STATISTIC_TABLE_NAME = 'carStatistic';
  export interface CarStatistic {
    id: number;
    carId: number;
    content: string;
    type: number;
    date: number;
  }

  export const ACTIVITIES = 'activities';
  export interface Activities {
    id: number;
    userId: number;
    sourceId: number;
    sourceName: string;
    date: number;
    activities: string;
  }
}
