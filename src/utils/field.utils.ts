export enum Flags {
  System = 1,
}

export class Field {
  static setFlagOn(v: { flags: number }, bit: number) {
    v.flags |= bit;
  }

  static setFlagOff(v: { flags: number }, bit: number) {
    v.flags &= ~bit;
  }
}

export class Flag {
  static Is(v: { flags: number } | number, bit: number) {
    const value = typeof v === 'number' ? v : v.flags;

    return (value & bit) === bit;
  }
}
