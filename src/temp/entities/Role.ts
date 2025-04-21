import { Models } from './Models';
import { RequireAtLeastOne } from './Types';
export namespace ServerRole {
  type Access = Pick<Models.FieldAccess, 'fieldId' | 'access'>;
  type WithAccesses = {
    accesses: Access[];
  };

  export type CreateRequest = Partial<WithAccesses> & Omit<Models.Role, 'id'>;
  export type UpdateRequest = RequireAtLeastOne<
    WithAccesses & Omit<Models.Role, 'id'>
  >;
  export type Response = WithAccesses & Models.Role;
  export type IdResponse = Pick<Response, 'id'>;

  export enum System {
    None = 0,
    // Editor = 200,
    Admin = 900,
    SuperAdmin = 1000,
  }

  export enum Custom {
    contactCenter = 'contactCenter',
    contactCenterChief = 'contactCenterChief',
    carShooting = 'carShooting',
    carShootingChief = 'carShootingChief',
    customerService = 'customerService',
    customerServiceChief = 'customerServiceChief',
    carSales = 'carSales',
    carSalesChief = 'carSalesChief',
  }
}
