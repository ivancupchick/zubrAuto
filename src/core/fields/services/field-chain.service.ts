import { Injectable } from '@nestjs/common';
import { FieldDomains, FieldType } from '../fields';
import { StringHash } from 'src/temp/models/hashes';
import { PrismaService } from 'src/prisma/prisma.service';
import { Models } from 'src/temp/entities/Models';
import { Prisma } from '@prisma/client';
import { getFieldChainsValue } from 'src/core/utils/field.utils';
import { ApiError } from 'src/core/exceptions/api.error';
import { getSpecialFilterByOperator } from 'src/core/utils/prisma-sort.utils';

@Injectable()
export class FieldChainService {
  constructor(private prisma: PrismaService) {}

  async findMany(
    where: Prisma.fieldIdsWhereInput & Prisma.longtextFieldsIdsWhereInput,
    sortOrder?: Prisma.SortOrder,
  ): Promise<Models.FieldChain[]> {
    let orderBy: Prisma.fieldIdsOrderByWithRelationInput = { id: 'desc' }; // TODO test

    if (sortOrder) {
      orderBy = { value: sortOrder };
    }

    const [fieldChains, longtextFieldChains] = await Promise.all([
      this.prisma.fieldIds.findMany({ where: where, orderBy: orderBy }),
      this.prisma.longtextFieldsIds.findMany({
        where: where,
        orderBy: orderBy,
      }),
    ]);

    return [...fieldChains, ...longtextFieldChains];
  }

  async update(
    // TODO refactor
    data: Prisma.fieldIdsUpdateInput & Prisma.longtextFieldsIdsUpdateInput,
    where: Prisma.fieldIdsWhereInput & Prisma.longtextFieldsIdsWhereInput,
  ): Promise<Prisma.BatchPayload> {
    const [fieldChains, longtextFieldChains]: [
      Prisma.BatchPayload,
      Prisma.BatchPayload,
    ] = await Promise.all([
      this.prisma.fieldIds.updateMany({ where: where, data: data }), // TODO updateUnique
      this.prisma.longtextFieldsIds.updateMany({ where: where, data: data }), // TODO updateUnique
    ]);

    return {
      count: fieldChains.count + longtextFieldChains.count,
      ...fieldChains,
      ...longtextFieldChains,
    };
  }

  async findOne(
    where: Prisma.fieldIdsWhereInput & Prisma.longtextFieldsIdsWhereInput,
  ): Promise<Models.FieldChain> {
    // TODO need to make sure that only one field meets all the conditions
    const [fieldChain, longtextFieldChain] = await Promise.all([
      this.prisma.fieldIds.findMany({ where }),
      this.prisma.longtextFieldsIds.findMany({ where }),
    ]);

    return [...fieldChain, ...longtextFieldChain][0];
  }

  async deleteMany(
    payload: Prisma.fieldIdsWhereInput & Prisma.longtextFieldsIdsWhereInput,
  ): Promise<Prisma.BatchPayload> {
    const [fieldChains, longtextFieldChains] = await Promise.all([
      this.prisma.fieldIds.deleteMany({ where: payload }),
      this.prisma.longtextFieldsIds.deleteMany({ where: payload }),
    ]);

    return {
      count: fieldChains.count + longtextFieldChains.count,
      ...fieldChains,
      ...longtextFieldChains,
    };
  }

  async create(fieldChainData: Omit<Models.FieldChain, 'id'>) {
    const field = await this.prisma.fields.findUnique({
      where: { id: fieldChainData.fieldId },
    });

    let findFirst =
      field.type !== FieldType.Textarea // TODO type it
        ? this.prisma.fieldIds.findFirst.bind(this.prisma.fieldIds)
        : this.prisma.longtextFieldsIds.findFirst.bind(
            this.prisma.longtextFieldsIds,
          );
    let create =
      field.type !== FieldType.Textarea
        ? this.prisma.fieldIds.create.bind(this.prisma.fieldIds)
        : this.prisma.longtextFieldsIds.create.bind(
            this.prisma.longtextFieldsIds,
          );

    const existFieldChain = await findFirst({
      where: {
        sourceName: fieldChainData.sourceName,
        sourceId: fieldChainData.sourceId,
        fieldId: fieldChainData.fieldId,
      },
    });

    if (existFieldChain) {
      throw ApiError.BadRequest(`This Field Chain exists`);
    }

    const fieldChain: Models.FieldChain = await create({
      data: {
        fieldId: fieldChainData.fieldId,
        value: fieldChainData.value || '',
        sourceId: fieldChainData.sourceId,
        sourceName: fieldChainData.sourceName,
      },
    });

    return fieldChain;
  }

  async updateById(
    id: number,
    fieldId: number,
    fieldChainData:
      | Prisma.fieldIdsUpdateInput
      | Prisma.longtextFieldsIdsUpdateInput,
  ) {
    const field = await this.prisma.fields.findUnique({
      where: { id: fieldId },
    });

    // let updateById = fieldChainRepository.updateById.bind(fieldChainRepository);

    let update =
      field.type !== FieldType.Textarea // TODO type it
        ? this.prisma.fieldIds.update.bind(this.prisma.fieldIds)
        : this.prisma.longtextFieldsIds.update.bind(
            this.prisma.longtextFieldsIds,
          );

    // switch (field.type) {
    //   case FieldType.Textarea:
    //     updateById = longtextFieldChainRepository.updateById.bind(longtextFieldChainRepository);
    //     break;
    // }

    const fieldChain = await update({
      where: { id },
      data: { ...fieldChainData },
    });
    return fieldChain;
  }

  async getFieldChain(fieldId: number, id: number) {
    // TODO rename
    const field = await this.prisma.fields.findUnique({
      where: { id: fieldId },
    });

    let findUnique =
      field.type !== FieldType.Textarea // TODO type it
        ? this.prisma.fieldIds.findUnique.bind(this.prisma.fieldIds)
        : this.prisma.longtextFieldsIds.findUnique.bind(
            this.prisma.longtextFieldsIds,
          );

    const fieldChain = await findUnique({ where: { id: id } });
    return fieldChain;
  }

  async getEntityIdsByQuery(
    sourceName: Models.Table,
    entityDomain: FieldDomains,
    query: StringHash,
    sortOrder: Prisma.SortOrder = null,
  ): Promise<number[]> {
    const ids = new Set<string>(query['id']?.split(',') || []);
    delete query['id'];

    let fieldNames = Object.keys(query);

    if (
      entityDomain === FieldDomains.Client &&
      fieldNames.length === 0 &&
      ids.size === 0
    ) {
      const needChaines = await this.prisma.fieldIds.findMany({
        where: {
          sourceName: sourceName,
        },
        select: {
          sourceId: true,
        },
      });

      const allIds = needChaines.map((ch) => ch.sourceId);

      return [...new Set<number>(allIds)];
    }

    if (!ids.size && !fieldNames.length) {
      return [];
    }

    const specialFieldNameOperators = fieldNames.filter((fn) =>
      fn.includes('filter-operator'),
    ); // TODO select startof 'filter-operator-';
    const specialFieldNames = specialFieldNameOperators.map(
      (n) => n.split('filter-operator-')[1],
    );

    const specialFieldIds =
      specialFieldNames.length > 0
        ? await this.prisma.fields.findMany({
            where: {
              domain: entityDomain,
              name: { in: specialFieldNames },
            },
            select: {
              id: true,
              name: true,
            },
          })
        : [];

    const specialFieldChaines = specialFieldIds.length
      ? await Promise.all(
          specialFieldNames.map((fieldName) => {
            const id = specialFieldIds.find((fc) => fc.name === fieldName);
            const findManyArgs: Prisma.fieldIdsFindManyArgs = {
              where: {
                sourceName: sourceName,
                fieldId: id.id,
              },
              select: {
                sourceId: true,
              },
              orderBy: {
                sourceId: sortOrder || 'asc',
              },
            };

            if (ids && ids.size > 0) {
              findManyArgs.where.sourceId = { in: [...ids].map((id) => +id) };
            }

            const operatorName = specialFieldNameOperators.find((fc) =>
              fc.includes(fieldName),
            );

            findManyArgs.where.value = getSpecialFilterByOperator(
              query,
              query[operatorName],
              fieldName,
            );

            return this.prisma.fieldIds.findMany(findManyArgs);
          }),
        )
      : [];

    const specialIds = specialFieldChaines
      .map((s) => s.map((item) => item.sourceId))
      .reduce((prev, cur) => {
        if (!prev.length) {
          return [...cur];
        }

        return cur.filter((id) => prev.includes(id));
      }, []);

    fieldNames = fieldNames.filter(
      (n) =>
        !specialFieldNameOperators.includes(n) &&
        !specialFieldNames.includes(n),
    );

    if (fieldNames.length === 0 && ids.size > 0) {
      if (specialIds && specialIds.length > 0) {
        return specialIds;
      } else {
        return [...ids].map((id) => +id);
      }
    }

    const fields =
      fieldNames.length > 0
        ? await this.prisma.fields.findMany({
            where: {
              domain: entityDomain,
              name: {
                in: fieldNames,
              },
            },
            select: {
              id: true,
              name: true,
              variants: true,
              type: true,
            },
          })
        : [];

    const fieldIdsWhereInput: Prisma.fieldIdsWhereInput = {
      sourceName: sourceName,
    };

    if (ids && ids.size > 0) {
      fieldIdsWhereInput.sourceId = { in: [...ids].map((id) => +id) };
    }

    if (specialIds && specialIds.length > 0) {
      fieldIdsWhereInput.sourceId = { in: specialIds };
    }

    if (fields.length > 0) {
      fieldIdsWhereInput.fieldId = { in: fields.map((f) => f.id) };
      fieldIdsWhereInput.value = { in: getFieldChainsValue(query, fields) };
    }

    const needChaines =
      fields.length > 0
        ? await this.prisma.fieldIds.findMany({
            where: fieldIdsWhereInput,
            select: {
              fieldId: true,
              sourceId: true,
            },
            orderBy: {
              sourceId: sortOrder || 'asc',
            },
          })
        : [];

    let searchIds = new Set<number>();

    const matchObj: {
      [key: number]: number[];
    } = {};

    if (needChaines.length > 0) {
      needChaines.forEach((ch) => {
        if (!matchObj[ch.fieldId]) {
          matchObj[ch.fieldId] = [];
        }
        matchObj[ch.fieldId].push(ch.sourceId);
      });

      const chainsIds = Object.values(matchObj).reduce((prev, cur) => {
        if (!prev.length) {
          return [...cur];
        }

        return cur.filter((id) => prev.includes(id));
      }, []);

      searchIds = new Set(chainsIds);
    } else if (specialIds.length) {
      return [...specialIds];
    }

    return [...searchIds].map((id) => +id);
  }
}
