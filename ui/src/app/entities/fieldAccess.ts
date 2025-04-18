import { FieldDomains } from '../../../../src/core/fields/fields';
import { FieldAccess as fieldAccess } from '../../../../src/temp/entities/FieldAccess';

export import FieldAccess = fieldAccess;

export interface AccessChip {
  domainName: string;
  sourceName: string;
  accessName: string;
  access: number;
  domain: FieldDomains;
  sourceId: number;
}
