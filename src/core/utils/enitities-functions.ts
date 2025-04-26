import { Prisma } from '@prisma/client';
import { StringHash } from 'src/temp/models/hashes';
import { getSpecialFilterByOperator } from './prisma-sort.utils';

type NaturalDelegate =
  | Prisma.activitiesDelegate
  | Prisma.callRequestsDelegate
  | Prisma.phoneCallsDelegate
  | Prisma.usersDelegate
  | Prisma.carsDelegate
  | Prisma.carOwnersDelegate;

export class BaseQuery {
  page: string;
  size: string;
  sortOrder: Prisma.SortOrder;
  sortField: string;
}

export async function getEntityIdsByNaturalQuery<T extends { id: number }>(
  repository: NaturalDelegate,
  query: StringHash<any>,
  sortOrderr: string = null,
): Promise<number[]> {
  // TODO refactor all this
  const ids = new Set<string>(query['id']?.split(',') || []);
  delete query['id'];

  if (!ids.size && !Object.keys(query).length) {
    return [];
  }

  const { sortOrder, sortField } = query;
  delete query['sortOrder'];
  delete query['sortField'];

  let columnsNames = Object.keys(query);

  const specialColumnNameOperators = columnsNames.filter(
    (
      fn, // TODO test
    ) => fn.includes('filter-operator'),
  ); // TODO select startof 'filter-operator-';
  const specialColumnNames = specialColumnNameOperators.map(
    (n) => n.split('filter-operator-')[1],
  );

  columnsNames = columnsNames.filter(
    (n) =>
      !specialColumnNameOperators.includes(n) &&
      !specialColumnNames.includes(n),
  );

  if (columnsNames.length === 0 && specialColumnNames.length === 0) {
    if (ids.size > 0) {
      return [...ids].map((id) => +id);
    } else {
      const entities = await (repository as any).findMany({
        orderBy: {
          [sortField || 'id']:
            (sortOrder?.toLowerCase() as Prisma.SortOrder) ||
            Prisma.SortOrder.asc,
        },
      });
      return entities.map((e) => +e.id);
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

      where[cn] = getSpecialFilterByOperator(query, query[operatorName], cn);
    });

    specialColumnEntities = await (repository as any).findMany({
      where: where as any,
      orderBy,
    });
  }

  const specialIds: number[] = specialColumnEntities.map((e) => +e.id);

  let entitiesByQuery: { id: number }[] = [];

  if (columnsNames.length) {
    // TODO refactor block
    const where: Prisma.activitiesWhereInput = {};
    const orderBy: Prisma.fieldIdsOrderByWithRelationInput = {};

    if (sortOrder) {
      orderBy[sortField] = sortOrder.toLocaleLowerCase();
    }

    columnsNames.forEach((cn, chIndex) => {
      switch (query[cn]) {
        case 'true':
          where[cn] = true;
          break;
        case 'false':
          where[cn] = false;
          break;
        default:
          where[cn] = query[cn];
          break;
      }

      switch (cn) {
        case 'userId':
        case 'id':
        case 'sourceId':
          where[cn] = +query[cn];
          break;
      }
    });

    entitiesByQuery = await (repository as any).findMany({
      where: where as any,
      orderBy,
    });
  }

  const searchIds = new Set<string>();

  if (ids.size > 0) {
    entitiesByQuery.forEach((entity) => {
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
    entitiesByQuery.forEach((entity) => {
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
      specialIds.forEach((id) => {
        if (ids.has(`${id}`)) {
          searchIds.add(`${id}`);
        }
      });
    } else {
      specialIds.forEach((id) => {
        searchIds.add(`${id}`);
      });
    }
  }

  return [...searchIds].map((id) => +id);
}
