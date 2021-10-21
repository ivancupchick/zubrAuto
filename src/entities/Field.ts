import { Database } from "./Database";

export namespace RealField {
  export type Response = ServerField.Entity & RealField.Request;

  export type Request = {
    id: number;
    name?: string;
    value: string;
  }
}

export namespace ServerField {
  export type BaseEntity = {
    flags: number;
    type: FieldType;
    name: string;
    domain: FieldDomains;
    variants: string;
    showUserLevel: number;
  }

  export type Entity = Database.Field & BaseEntity;

  export type CreateRequest = BaseEntity;

  export namespace DB {
    export type CreateChain = {
      sourceId: number;
      fieldId: number;
      value: string;
      sourceName: string;
    }

    export type UpdateChainExpression = {
      sourceId: number;
      fieldId: number;
      sourceName: string;
    }
  }
}

export enum FieldDomains {
  'Car',
  'CarOwner',
  'Client'
}

export enum FieldType {
  'Boolean',
  'Radio',
  'Text',
  'Multiselect',
  'Number',
  'Dropdown'
}
