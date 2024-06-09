import { StringHash } from "src/app/entities/constants";

export function skipEmptyFilters(filters: any): any {
  const newFilters: StringHash = {};
  Object.keys(filters).forEach(key => {
    if (filters[key] !== null && filters[key] !== 'null' && filters[key] !== '' && filters[key] !== 'all') {
      newFilters[key] = filters[key];
    }
  });
  return newFilters;
}
