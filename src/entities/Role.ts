import { BitHelper } from "../utils/bit.utils";
import { Models } from "./Models";

export namespace ServerRole {
  export type BaseEntity = {
    systemName: string;
  }

  interface WithAccesses {
    accesses: FieldAccess.Real[]
  }

  export type Entity = Models.Role & BaseEntity;

  export type CreateRequest = WithAccesses & BaseEntity;
  export type UpdateRequest = WithAccesses & BaseEntity;

  export type GetResponse = WithAccesses & Entity;
}

export namespace FieldAccess {
  export enum AccessBits {
    noAccess = 1,
    writable = 2,
  }

  export interface Real {
    fieldId: number,
    access: number;
  }

  export function isNoAccess(access: number) {
    return BitHelper.Is(access, AccessBits.noAccess);
  }

  export function writable(access: number) {
    return BitHelper.Is(access, AccessBits.writable);
  }
}
