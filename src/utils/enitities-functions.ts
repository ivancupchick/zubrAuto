import { StringHash } from "../models/hashes";
import { BaseRepository } from "../repositories/base/base.repository";
import { ExpressionHash } from "./sql-queries";

export async function getEntityIdsByNaturalQuery<T extends { id: number }>(repository: BaseRepository<T>, query: StringHash) {
  const ids = new Set<string>((query['id'])?.split(',') || []);
  delete query['id'];

  const {
    sortOrder,
    sortField
  } = query;
  delete query['sortOrder'];
  delete query['sortField'];

  const columnsNames = Object.keys(query);

  if (columnsNames.length === 0) {
    if (ids.size > 0) {
      return [...ids];
    } else {
      const entities = await repository.getAll(sortField, sortOrder);
      return entities.map(e => e.id).map(String);
    }
  }

  const entitiesByQuery = await repository.find(columnsNames.reduce((prev, curr) => {
    return Object.assign(prev, {
      [curr]: [query[curr]]
    })
  }, {} as ExpressionHash<T>), sortField, sortOrder);

  const searchIds = new Set<string>();

  if (ids.size > 0) {
    entitiesByQuery.forEach(entity => {
      if (ids.has(`${entity.id}`)) {
        searchIds.add(`${entity.id}`);
      }
    });
  } else {
    entitiesByQuery.forEach(entity => {
      searchIds.add(`${entity.id}`);
    });
  }

  return [...searchIds];
}
