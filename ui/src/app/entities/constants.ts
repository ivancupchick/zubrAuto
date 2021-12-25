import { Constants as consts } from '../../../../src/utils/constansts';
import { Models as serverModels } from '../../../../src/entities/Models';

export import Constants = consts;
export import BDModels = serverModels

export interface StringHash<T = string> {
  [key: string]: T
}
