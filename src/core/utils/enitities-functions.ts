import { Prisma } from "@prisma/client";
import { StringHash } from "src/temp/models/hashes";

type NaturalDelegate = Prisma.activitiesDelegate | Prisma.callRequestsDelegate | Prisma.phoneCallsDelegate | Prisma.usersDelegate | Prisma.carsDelegate;

export class BaseQuery {
  page: number;
  size: number;
  sortOrder: Prisma.SortOrder;
  sortField: string;
}

export async function getEntityIdsByNaturalQuery<T extends { id: number }>(repository: NaturalDelegate, query: StringHash<any>): Promise<number[]> { // TODO refactor all this
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
      return [...ids].map(id => +id);
    } else {
      const entities = await (repository as any).findMany({ orderBy: { [sortField || 'id']: sortOrder?.toLowerCase() as Prisma.SortOrder || Prisma.SortOrder.desc }} );
      return entities.map(e => +e.id);
    }
  }

  let specialColumnEntities: { id: number }[] = [];

  if (specialColumnNames.length) {
    const where: Prisma.activitiesWhereInput = {};

    const orderBy: Prisma.fieldIdsOrderByWithRelationInput = {};

    if (sortOrder) {
      orderBy[sortField] = sortOrder.toLocaleLowerCase();
    }

    specialColumnNames.forEach((cn, chIndex) => {
      const operatorName = specialColumnNameOperators[chIndex];

      switch (query[operatorName]) { // TODO use DRY please
        case '<':
          where[cn] = {
            lte: query[cn],
          };
          break;
        case '>':
          where[cn] = {
            gte: query[cn],
          };
          break;
        case 'range':
          const values: [string, string] = query[cn].split(
            '-',
          ) as [string, string]; // TODO controller validation

          where[cn] = {
            lte: values[1],
            gte: values[0],
          };
          break;
        case 'like':
        case 'LIKE':
          where[cn] = {
            contains: query[cn], // TODO test
          };
          break;
      }

      // if (operatorName === 'range') {
      //   const values: [string, string] = query[cn].split('-') as [string, string]; // TODO controller validation
      //   return `(${cn} > '${values[0]}' AND ${cn} < '${values[1]}')`
      // }

      // return `(${cn} ${query[operatorName]} '${query[cn]}')`
    });

    specialColumnEntities = await (repository as any).findMany({where: where as any, orderBy})
  }

  const specialIds: number[] = specialColumnEntities.map(e => +e.id);

  let entitiesByQuery: { id: number }[] = [];

  if (columnsNames.length) { // TODO refactor block
    const where: Prisma.activitiesWhereInput = {};
    const orderBy: Prisma.fieldIdsOrderByWithRelationInput = {};

    if (sortOrder) {
      orderBy[sortField] = sortOrder.toLocaleLowerCase();
    }

    columnsNames.forEach((cn, chIndex) => {
      switch (query[cn]) {
        case 'true': where[cn] = true;
          break;
        case 'false': where[cn] = false;
          break;
        default:
          where[cn] = query[cn];
          break;
      }

      switch (cn) {
        case 'userId':
        case 'id':
          where[cn] = +query[cn];
          break;
      }

    });

    entitiesByQuery = await (repository as any).findMany({where: where as any, orderBy})
  }

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

  if (!entitiesByQuery.length) {
    if (ids.size > 0) {
      specialIds.forEach(id => {
        if (ids.has(`${id}`)) {
          searchIds.add(`${id}`);
        }
      });
    } else {
      specialIds.forEach(id => {
        searchIds.add(`${id}`);
      });
    }
  }

  return [...searchIds].map(id => +id);
}
