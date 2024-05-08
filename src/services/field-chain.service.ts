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
  async find(expressionHash: ExpressionHash<Models.FieldChain>): Promise<Models.FieldChain[]> {
    const [fieldChains, longtextFieldChains] = await Promise.all([fieldChainRepository.find(expressionHash), longtextFieldChainRepository.find(expressionHash)]);

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

  async getEntityIdsByQuery(sourceName: string, entityDomain: FieldDomains, query: StringHash) {
    const ids = new Set<string>((query['id'])?.split(',') || []);
    delete query['id'];

    const fieldNames = Object.keys(query);

    if (fieldNames.length === 0 && ids.size > 0) {
      return [...ids];
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
    }

    if (ids && ids.size > 0) {
      needChainesOptions.sourceId = [...ids];
    }

    if (fields.length > 0) {
      needChainesOptions.fieldId = fields.map(f => `${f.id}`);
      needChainesOptions.value = getFieldChainsValue(query, fields);
    }

    const needChaines = fields.length > 0 ? await fieldChainRepository.find(needChainesOptions) : [];

    const searchIds = new Set<string>();

    const matchObj: ExpressionHash<any> = {};

    if (needChaines.length > 0) {
      needChaines.forEach(ch => {
        if (!matchObj[ch.fieldId]) {
          matchObj[ch.fieldId] = [];
        }
        matchObj[ch.fieldId].push(`${ch.sourceId}`);
      });

      const matchKeys = fields.map(f => `${f.id}`);;

      needChaines.forEach(ch => {
        let currentMatch = 0;

        matchKeys.forEach(key => {
          if (matchObj[key] && matchObj[key].includes(`${ch.sourceId}`)) {
            ++currentMatch;
          }
        })

        if (currentMatch === matchKeys.length) {
          searchIds.add(`${ch.sourceId}`);
        }
      });
    }

    return [...searchIds];
  }
}

export = new FieldChainService();
