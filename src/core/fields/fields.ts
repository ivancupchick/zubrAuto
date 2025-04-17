import { Models } from '../../temp/entities/Models';

export enum FieldDomains {
  'Car',
  'CarOwner',
  'Client',
  'User',
  'Role',
}

export enum FieldType {
  'Boolean',
  'Radio',
  'Text',
  'Multiselect',
  'Number',
  'Dropdown',
  'Date',
  'Textarea', // LongtextFieldsChainRepository
}

export function getDomainByTableName(tableName: string): FieldDomains {
  switch (tableName) {
    // case Models.Table.Cars: return FieldDomains.Car;
    // case Models.Table.CarOwners: return FieldDomains.CarOwner;
    // case Models.Table.Clients: return FieldDomains.Client;
    // case Models.Table.Users: return FieldDomains.User;
    case Models.Table.Roles:
      return FieldDomains.Role;
    default:
      return FieldDomains.Car;
  }
}
