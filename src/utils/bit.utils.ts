export namespace BitHelper {
  export function setOn(value: number, bit: number) {
    return value | bit;
  }

  export function setOff(value: number, bit: number) {
    return value & ~bit;
  }

  export function Is(value: number, bit: number) {
    return (value & bit) === bit;
  }
}
