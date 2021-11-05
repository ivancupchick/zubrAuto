import { Constants as consts } from '../../../../src/utils/constansts';

export import Constants = consts;

export interface StringHash<T = string> {
  [key: string]: T
}
