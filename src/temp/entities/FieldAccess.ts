import { BitHelper } from '../../core/utils/bit.utils';

export namespace FieldAccess {
  export enum AccessBits {
    noAccess = 1,
    writable = 2,
  }

  export function isNoAccess(access: number) {
    return BitHelper.Is(access, AccessBits.noAccess);
  }

  export function writable(access: number) {
    return BitHelper.Is(access, AccessBits.writable);
  }
}
