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

  async createFieldChain(fieldChainData: Models.FieldChain) {
    const existFieldChain = await fieldChainRepository.findOne({
      sourceId: [`${fieldChainData.sourceId}`],
      fieldId: [`${fieldChainData.fieldId}`],
      sourceName: [`${fieldChainData.sourceName}`]
    });
    if (existFieldChain) {
      throw ApiError.BadRequest(`This Field Chain exists`);
    }

    const fieldChain: Models.FieldChain = await fieldChainRepository.create({
      id: 0, // will be deleted in DAO
      fieldId: fieldChainData.fieldId,
      value: fieldChainData.value || '',
      sourceId: fieldChainData.sourceId,
      sourceName: fieldChainData.sourceName
    });

    return fieldChain;
  }

  async updateFieldChain(id: number, fieldChainData: Models.FieldChain) {
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

  // async getFieldChainsByDomain(domain: FieldDomains) {
  //   const fieldChains = await fieldChainRepository.find({ domain: [`${domain}`] });
  //   return fieldChains;
  // }
}

export = new FieldChainService();
