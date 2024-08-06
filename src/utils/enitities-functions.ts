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

  let columnsNames = Object.keys(query);

  const specialColumnNameOperators = columnsNames.filter((fn) => // TODO test
    fn.includes("filter-operator")
  ); // TODO select startof 'filter-operator-';
  const specialColumnNames = specialColumnNameOperators.map(
    (n) => n.split("filter-operator-")[1]
  );

  columnsNames = columnsNames.filter(
    (n) =>
      !specialColumnNameOperators.includes(n) && !specialColumnNames.includes(n)
  );

  if (columnsNames.length === 0 && specialColumnNames.length === 0) {
    if (ids.size > 0) {
      return [...ids];
    } else {
      const entities = await repository.getAll(sortField, sortOrder);
      return entities.map(e => e.id).map(String);
    }
  }

  const specialColumnEntities = specialColumnNames.length
    ? await repository.queryRequest(`SELECT * FROM \`${repository.tableName}\` WHERE (${
        specialColumnNames.map((cn, chIndex) => {
          const operatorName = specialColumnNameOperators[chIndex];

          return `(${cn} ${query[operatorName]} '${query[cn]}')`
        }).join(' AND ')
      }) ORDER BY ${sortField} ${sortOrder};`)
    : [];

  const specialIds: number[] = specialColumnEntities.map(e => +e.id);

  const entitiesByQuery = columnsNames.length
    ? await repository.find(columnsNames.reduce((prev, curr) => {
        return Object.assign(prev, {
          [curr]: [query[curr]]
        })
      }, {} as ExpressionHash<T>), sortField, sortOrder)
    : [];

  const searchIds = new Set<string>();

  if (ids.size > 0) {
    entitiesByQuery.forEach(entity => {
      if (ids.has(`${entity.id}`)) {
        if (specialColumnNames.length) {
          if (specialIds.includes(+entity.id)) {
            searchIds.add(`${entity.id}`);
          }
        } else {
          searchIds.add(`${entity.id}`);
        }
      }
    });
  } else {
    entitiesByQuery.forEach(entity => {
      if (specialColumnNames.length) {
        if (specialIds.includes(+entity.id)) {
          searchIds.add(`${entity.id}`);
        }
      } else {
        searchIds.add(`${entity.id}`);
      }
    });
  }

  return [...searchIds];
}
