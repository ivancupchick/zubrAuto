import { Prisma } from '@prisma/client';
import { StringHash } from 'src/temp/models/hashes';

export function getSpecialFilterByOperator(
  query: StringHash<string>,
  operator: string,
  fieldName: string,
): string | Prisma.StringNullableFilter {
  switch (operator) {
    case '<':
      return {
        lte: query[fieldName],
      };
    case '>':
      return {
        gte: query[fieldName],
      };
    case 'range':
      const values: [string, string] = query[fieldName].split('-') as [
        string,
        string,
      ];

      return {
        lte: values[1],
        gte: values[0],
      };
    case 'like':
    case 'LIKE':
      let value = query[fieldName];
      if (value.indexOf('%') === -1) {
        value = `%${value}%`;
      }
      return {
        contains: query[fieldName],
      };
    default:
      return query[fieldName];
  }
}
