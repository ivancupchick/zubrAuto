import { Models } from "../entities/Models";
import { RealField, ServerField } from "../entities/Field";

export enum Flags {
  System = 1,
}

export class FlagField {
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

export const getFieldsWithValues = (chainedFields: Models.Field[], chaines: Models.FieldChain[], sourceId: number): RealField.Response[] => {
  return chainedFields
    .filter(cf => !!chaines
      .filter(ch => ch.sourceId === sourceId)
      .find(ch => ch.fieldId === cf.id)
    )
    .map(cf => {
      return {
        id: cf.id,
        name: cf.name,
        flags: cf.flags,
        type: cf.type,
        domain: cf.domain,
        variants: cf.variants,
        showUserLevel: cf.showUserLevel,
        value: chaines.find(c => c.fieldId === cf.id)?.value || ''
      } 
    })
}
