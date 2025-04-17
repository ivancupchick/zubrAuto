import { FieldDomains } from "../../core/fields/fields";
import { Models } from "./Models";
import { RequireAtLeastOne } from "./Types";

export namespace RealField {
  export type Response = Models.Field & { value: string; };

  export type Request = {
    id: number;
    name: string;
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


export function getTableNameByDomain(domain: FieldDomains): string {
  switch (domain) {
    // case FieldDomains.Car: return Models.Table.Cars;
    // case FieldDomains.CarOwner: return Models.Table.CarOwners;
    // case FieldDomains.Client: return Models.Table.Clients;
    case FieldDomains.Role: return Models.Table.Roles;
    default: return 'None';
  }
}
