export type FieldWithValue = IField & CreateEntitiesField;

export type IField = CreateFieldRequest & {
  id: number;
}

export interface CreateFieldRequest {
  flags: number;
  type: FieldType;
  name: string;
  domain: FieldDomains;
  variants?: string;
  showUserLevel: number;
}

export interface CreateEntitiesField {
  id: number;
  value: string;
}

export interface CreateFieldId {
  sourceId: number;
  fieldId: number;
  value: string;
}

export enum FieldDomains {
  'Car',
  'CarOwner',
  'Client'
}

export enum FieldType {
  'Boolean',
  'Radio',
  'Text',
  'Multiselect',
  'Number'
}
