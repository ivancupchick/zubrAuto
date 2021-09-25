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

export enum FieldDomains {
  'Car',
  'CarOwner',
  'Client'
}

export enum FieldType {
  'Checkbox',
  'Radio',
  'Text',
  'Multiselect'
}
