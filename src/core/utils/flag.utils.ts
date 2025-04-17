import { BitHelper } from "../utils/bit.utils";

export namespace FlagField {
  export enum Flags {
    System = 1,
    Virtual = 2,
  }

  export function setFlagOn(v: { flags: number }, bit: Flags) {
    // v.flags |= bit;
    v.flags = BitHelper.setOn(v.flags, bit)
  }

  export function setFlagOff(v: { flags: number }, bit: Flags) {
    // v.flags &= ~bit;
    v.flags = BitHelper.setOff(v.flags, bit);
  }

  export function Is(v: { flags: number } | number, bit: Flags) {
    const value = typeof v === 'number' ? v : v.flags;
    // (value & bit) === bit;
    return BitHelper.Is(value, bit);
  }
}
