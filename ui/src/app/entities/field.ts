import { FieldDomains as domain, FieldType as type, CreateFieldRequest, IField, FieldWithValue } from '../../../../src/entities/Field'

export type CarField = FieldWithValue;
export type CreateField = CreateFieldRequest;
export type Field = IField;

export import FieldType = type;
export import Domain = domain;
