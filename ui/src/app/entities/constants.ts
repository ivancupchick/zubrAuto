import { Constants as consts } from '../../../../src/utils/constansts';
import { Models as serverModels } from '../../../../src/entities/Models';
import { BaseList as baseList } from '../../../../src/entities/Types';

export import Constants = consts;
export import BDModels = serverModels;
export type BaseList<T> = baseList<T>;

export interface StringHash<T = string> {
  [key: string]: T
}
