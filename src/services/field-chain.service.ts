import { FieldDomains, FieldType } from '../entities/Field';
import { Models } from '../entities/Models';
import { ApiError } from '../exceptions/api.error';
import { StringHash } from '../models/hashes';
import fieldChainRepository from '../repositories/base/field-chain.repository';
import fieldRepository from '../repositories/base/field.repository';
import longtextFieldChainRepository from '../repositories/base/longtext-field-chain.repository';
import { getFieldChainsValue } from '../utils/field.utils';
import { ExpressionHash } from '../utils/sql-queries';

class FieldChainService {
  async find(expressionHash: ExpressionHash<Models.FieldChain>, sortOrder?: string): Promise<Models.FieldChain[]> {
    const [fieldChains, longtextFieldChains] = sortOrder
      ? await Promise.all([fieldChainRepository.find(expressionHash, 'value', sortOrder), longtextFieldChainRepository.find(expressionHash, 'value', sortOrder)])
      : await Promise.all([fieldChainRepository.find(expressionHash), longtextFieldChainRepository.find(expressionHash)]);

    return [...fieldChains, ...longtextFieldChains];
  }

  async update(newValues: Partial<Omit<Models.FieldChain, "id">>, expressionHash: ExpressionHash<Models.FieldChain>): Promise<Models.FieldChain[]> {
    const [fieldChains, longtextFieldChains] = await Promise.all([fieldChainRepository.update(newValues, expressionHash), longtextFieldChainRepository.update(newValues, expressionHash)]);

    return [...fieldChains, ...longtextFieldChains];
  }

  async findOne(expressionHash: ExpressionHash<Models.FieldChain>): Promise<Models.FieldChain> {
    const [fieldChain, longtextFieldChain] = await Promise.all([fieldChainRepository.findOne(expressionHash), longtextFieldChainRepository.findOne(expressionHash)]);

    return fieldChain || longtextFieldChain;
  }

  async delete(expressionHash: ExpressionHash<Models.FieldChain>): Promise<Models.FieldChain[]> {
    const [fieldChains, longtextFieldChains] = await Promise.all([fieldChainRepository.delete(expressionHash), longtextFieldChainRepository.delete(expressionHash)]);

    return [...fieldChains, ...longtextFieldChains];
  }

  async getAllFieldChains() {
    const [fieldChains, longtextFieldChains] = await Promise.all([fieldChainRepository.getAll(), longtextFieldChainRepository.getAll()]);
    return [...fieldChains, ...longtextFieldChains];
  }

  async create(fieldChainData: Omit<Models.FieldChain, 'id'>) {
    const field = await fieldRepository.findById(+fieldChainData.fieldId);

    let findOne = fieldChainRepository.findOne.bind(fieldChainRepository);
    let create = fieldChainRepository.create.bind(fieldChainRepository);

    switch (field.type) {
      case FieldType.Textarea:
        findOne = longtextFieldChainRepository.findOne.bind(longtextFieldChainRepository);
        create = longtextFieldChainRepository.create.bind(longtextFieldChainRepository);
        break;
    }

    const existFieldChain = await findOne({
      sourceName: [`${fieldChainData.sourceName}`],
      sourceId: [`${fieldChainData.sourceId}`],
      fieldId: [`${fieldChainData.fieldId}`],
    });
    if (existFieldChain) {
      throw ApiError.BadRequest(`This Field Chain exists`);
    }

    const fieldChain: Models.FieldChain = await create({
      fieldId: fieldChainData.fieldId,
      value: fieldChainData.value || '',
      sourceId: fieldChainData.sourceId,
      sourceName: fieldChainData.sourceName
    });

    return fieldChain;
  }

  async updateById(id: number, fieldId: number, fieldChainData: Partial<Omit<Models.FieldChain, 'id'>>) {
    const field = await fieldRepository.findById(+fieldId);

    let updateById = fieldChainRepository.updateById.bind(fieldChainRepository);

    switch (field.type) {
      case FieldType.Textarea:
        updateById = longtextFieldChainRepository.updateById.bind(longtextFieldChainRepository);
        break;
    }

    const fieldChain = await updateById(id, fieldChainData);
    return fieldChain
  }

  async deleteFieldChain(fieldId: number, id: number) {
    const field = await fieldRepository.findById(+fieldId);

    let deleteById = fieldChainRepository.deleteById.bind(fieldChainRepository);

    switch (field.type) {
      case FieldType.Textarea:
        deleteById = longtextFieldChainRepository.deleteById.bind(longtextFieldChainRepository);
        break;
    }

    const fieldChain = await deleteById(id);
    return fieldChain
  }

  async getFieldChain(fieldId: number, id: number) {
    const field = await fieldRepository.findById(+fieldId);

    let findById = fieldChainRepository.findById.bind(fieldChainRepository);

    switch (field.type) {
      case FieldType.Textarea:
        findById = longtextFieldChainRepository.findById.bind(longtextFieldChainRepository);
        break;
    }

    const fieldChain = await findById(id);
    return fieldChain;
  }

  async getEntityIdsByQuery(sourceName: string, entityDomain: FieldDomains, query: StringHash): Promise<string[]> {
    const ids = new Set<string>((query['id'])?.split(',') || []);
    delete query['id'];

    let fieldNames = Object.keys(query);

    if (fieldNames.length === 0 && ids.size === 0) {
      const needChaines = await fieldChainRepository.find({
        sourceName: [sourceName],
      });

      const allIds = needChaines.map(ch => `${ch.sourceId}`);

      return [...(new Set<string>(allIds))];
    }

    const specialFieldNameOperators = fieldNames.filter((fn) =>
      fn.includes("filter-operator")
    ); // TODO select startof 'filter-operator-';
    const specialFieldNames = specialFieldNameOperators.map(
      (n) => n.split("filter-operator-")[1]
    );

    const specialFieldIds = specialFieldNames.length > 0
      ? await fieldRepository.find({
        domain: [`${entityDomain}`],
        name: specialFieldNames,
      })
      : [];

    const specialFieldChaines = specialFieldIds.length ? await Promise.all(
      specialFieldNames.map((fieldName) => {
        const id = specialFieldIds.find(fc => fc.name === fieldName);
        const operatorName = specialFieldNameOperators.find(fc => fc.includes(fieldName));

        let fieldNameQuery = `value ${query[operatorName]} '${query[fieldName]}'`;

        if (operatorName === 'range') {
          const values: [string, string] = query[fieldName].split('-') as [string, string]; // TODO controller validation
          fieldNameQuery = `value > '${values[0]}' AND value < '${values[1]}'`
        }

        const queryRequest = `SELECT * FROM \`${Models.Table.FieldChains}\` WHERE (sourceName IN ('${Models.Table.Clients}') AND fieldId IN (${id.id}) AND ${fieldNameQuery});`;

        return fieldChainRepository.queryRequest(queryRequest);
      })
    ) : [];

    const specialIds = specialFieldChaines.map(s => s.map(item => item.sourceId)).reduce((prev, cur) => {
      if (!prev.length) {
        return [...cur];
      }

      return cur.filter(id => prev.includes(id))
    }, []);

    fieldNames = fieldNames.filter(
      (n) =>
        !specialFieldNameOperators.includes(n) && !specialFieldNames.includes(n)
    );

    if (fieldNames.length === 0 && ids.size > 0) {
      if (specialIds && specialIds.length > 0) {
        ids
        return specialIds.filter(id => ids.has(`${id}`)).map(id => `${id}`); // TODO test
      } else {
        return [...ids];
      }
    }

    const fields =
      fieldNames.length > 0
        ? await fieldRepository.find({
            domain: [`${entityDomain}`],
            name: fieldNames,
          })
        : [];

    const needChainesOptions: ExpressionHash<Models.FieldChain> = {
      sourceName: [sourceName],
    };

    if (ids && ids.size > 0) {
      needChainesOptions.sourceId = [...ids];
    }

    if (fields.length > 0) {
      needChainesOptions.fieldId = fields.map((f) => `${f.id}`);
      needChainesOptions.value = getFieldChainsValue(query, fields);
    }

    const needChaines =
      fields.length > 0
        ? await fieldChainRepository.find(needChainesOptions)
        : [];

    const searchIds = new Set<string>();

    const matchObj: ExpressionHash<any> = {};

    if (needChaines.length > 0) {
      needChaines.forEach((ch) => {
        if (!matchObj[ch.fieldId]) {
          matchObj[ch.fieldId] = [];
        }
        matchObj[ch.fieldId].push(`${ch.sourceId}`);
      });

      const matchKeys = fields.map((f) => `${f.id}`);

      needChaines.forEach((ch) => {
        let currentMatch = 0;

        matchKeys.forEach((key) => {
          if (matchObj[key] && matchObj[key].includes(`${ch.sourceId}`)) {
            ++currentMatch;
          }
        });

        if (currentMatch === matchKeys.length) {
          if (specialIds && specialIds.length > 0) {
            if (specialIds.includes(ch.sourceId)) {
              searchIds.add(`${ch.sourceId}`);
            }
          } else {
            searchIds.add(`${ch.sourceId}`);
          }
        }
      });
    }

    return [...searchIds];
  }
}

export = new FieldChainService();
