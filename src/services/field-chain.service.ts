import { FieldDomains } from '../entities/Field';
import { Models } from '../entities/Models';
// import { FieldChainDomains, FieldChainType, ServerFieldChain } from '../entities/FieldChain';
import { ApiError } from '../exceptions/api.error';
import fieldChainRepository from '../repositories/base/field-chain.repository';

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
}

export = new FieldChainService();
