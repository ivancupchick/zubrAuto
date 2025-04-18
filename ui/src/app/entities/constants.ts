import { Constants as consts } from '../../../../src/core/constants/constants';
import { Models as serverModels } from '../../../../src/temp/entities/Models';
import { BaseList as baseList } from '../../../../src/temp/entities/Types';

export import Constants = consts;
export import DBModels = serverModels;
export type BaseList<T> = baseList<T>;

export interface StringHash<T = string> {
  [key: string]: T
}
