import { FieldDomains } from '../../../../src/entities/Field';
import { FieldAccess as fieldAccess } from '../../../../src/entities/FieldAccess';

export import FieldAccess = fieldAccess;

export interface AccessChip {
  domainName: string;
  sourceName: string;
  accessName: string;
  access: number;
  domain: FieldDomains;
  sourceId: number;
}
