import { Models } from "./Models";

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
  export type CreateRequest = Omit<Models.Field, 'id'>;
  export type UpdateRequest = Partial<Omit<Models.Field, 'id'>>;
  export type IdResponse = Pick<Models.Field, 'id'>;
  export type Response = Models.Field;
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
