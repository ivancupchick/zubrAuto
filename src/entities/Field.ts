import { Models } from "./Models";
import { RequireAtLeastOne } from "./Types";

export namespace RealField {
  export type Response = Models.Field & { value: string; };

  export type Request = {
    id: number;
    name?: string;
    value: string;
  }

  export namespace With {
    export type Response = {
      fields: RealField.Response[];
    }

    export type Request = {
      fields: RealField.Request[];
    }
  }
}

export namespace ServerField {
  type Access = Pick<Models.FieldAccess, 'sourceId' | 'access'> & { domain: FieldDomains };
  type WithAccesses = {
    accesses: Access[];
  }

  export type CreateRequest = Partial<WithAccesses> & Omit<Models.Field, 'id'>;
  export type UpdateRequest = RequireAtLeastOne<WithAccesses & Omit<Models.Field, 'id'>>;
  export type Response = WithAccesses & Models.Field;
  export type IdResponse = Pick<Models.Field, 'id'>;

}

export enum FieldDomains {
  'Car',
  'CarOwner',
  'Client',
  'User',
  'Role'
}

export enum FieldType {
  'Boolean',
  'Radio',
  'Text',
  'Multiselect',
  'Number',
  'Dropdown',
  'Date',
}

export function getTableNameByDomain(domain: FieldDomains): string {
  switch (domain) {
    // case FieldDomains.Car: return Models.CARS_TABLE_NAME;
    // case FieldDomains.CarOwner: return Models.CAR_OWNERS_TABLE_NAME;
    // case FieldDomains.Client: return Models.CLIENTS_TABLE_NAME;
    case FieldDomains.Role: return Models.ROLES_TABLE_NAME;
    default: return 'None';
  }
}

export function getDomainByTableName(tableName: string): FieldDomains {
  switch (tableName) {
    // case Models.CARS_TABLE_NAME: return FieldDomains.Car;
    // case Models.CAR_OWNERS_TABLE_NAME: return FieldDomains.CarOwner;
    // case Models.CLIENTS_TABLE_NAME: return FieldDomains.Client;
    // case Models.USERS_TABLE_NAME: return FieldDomains.User;
    case Models.ROLES_TABLE_NAME: return FieldDomains.Role;
    default: return FieldDomains.Car;
  }
}
