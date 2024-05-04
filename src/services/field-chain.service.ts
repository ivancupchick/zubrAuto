import { FieldDomains } from '../entities/Field';
import { Models } from '../entities/Models';
import { ApiError } from '../exceptions/api.error';
import { StringHash } from '../models/hashes';
import fieldChainRepository from '../repositories/base/field-chain.repository';
import fieldRepository from '../repositories/base/field.repository';
import { getFieldChainsValue } from '../utils/field.utils';
import { ExpressionHash } from '../utils/sql-queries';

class FieldChainService {
  async getAllFieldChains() {
    const fieldChains = await fieldChainRepository.getAll();
    return fieldChains;
  }

  async createFieldChain(fieldChainData: Omit<Models.FieldChain, 'id'>) {
    const existFieldChain = await fieldChainRepository.findOne({
      sourceName: [`${fieldChainData.sourceName}`],
      sourceId: [`${fieldChainData.sourceId}`],
      fieldId: [`${fieldChainData.fieldId}`],
    });
    if (existFieldChain) {
      throw ApiError.BadRequest(`This Field Chain exists`);
    }

    const fieldChain: Models.FieldChain = await fieldChainRepository.create({
      fieldId: fieldChainData.fieldId,
      value: fieldChainData.value || '',
      sourceId: fieldChainData.sourceId,
      sourceName: fieldChainData.sourceName
    });

    return fieldChain;
  }

  async updateFieldChain(id: number, fieldChainData: Partial<Omit<Models.FieldChain, 'id'>>) {
    const fieldChain = await fieldChainRepository.updateById(id, fieldChainData);
    return fieldChain
  }

  async deleteFieldChain(id: number) {
    const fieldChain = await fieldChainRepository.deleteById(id);
    return fieldChain
  }

  async getFieldChain(id: number) {
    const fieldChain = await fieldChainRepository.findById(id);
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
