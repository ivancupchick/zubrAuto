export type FieldWithValue = IField & {
  value: string
};

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
