import { StringHash } from "../models/hashes";
import { ExpressionHash } from "./sql-queries";

export async function getEntityIdsByNaturalQuery<T extends { id: number }>(findFunc: ((expressionHash: ExpressionHash<T>) => Promise<T[]>), query: StringHash) {
  const ids = new Set<string>((query['id'])?.split(',') || []);
  delete query['id'];

  const columnsNames = Object.keys(query);

  if (columnsNames.length === 0 && ids.size > 0) {
    return [...ids];
  }

  const entitiesByQuery = await findFunc(columnsNames.reduce((prev, curr) => {
    return Object.assign(prev, {
      [curr]: [query[curr]]
    })
  }, {} as ExpressionHash<T>));

  console.log(entitiesByQuery);

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
