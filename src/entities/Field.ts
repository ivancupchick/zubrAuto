import { Models } from "./Models";

export namespace RealField {
  export type Response = ServerField.Entity & RealField.Request;

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
  export type BaseEntity = {
    flags: number;
    type: FieldType;
    name: string;
    domain: FieldDomains;
    variants: string;
    showUserLevel: number; // maybe not need
  }

  export type Entity = Models.Field & BaseEntity;

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
  'Client',
  'User'
}

export enum FieldType {
  'Boolean',
  'Radio',
  'Text',
  'Multiselect',
  'Number',
  'Dropdown'
}
