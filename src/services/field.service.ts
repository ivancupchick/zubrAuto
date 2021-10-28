import { Models } from '../entities/Models';
import { FieldDomains, FieldType, ServerField } from '../entities/Field';
import { ApiError } from '../exceptions/api.error';
import fieldRepository from '../repositories/base/field.repository';

class FieldService {
  async getAllFields() {
    const fields = await fieldRepository.getAll();
    return fields;
  }

  async createField(fieldData: ServerField.CreateRequest) {
    const existField = await fieldRepository.findOne({ name: [fieldData.name], domain: [`${fieldData.domain}`] })
    if (existField || !fieldData.name || !fieldData.domain) {
      throw ApiError.BadRequest(`Field ${fieldData.name} exists`);
    }

    const field: Models.Field = await fieldRepository.create({
      id: 0, // will be deleted in DAO
      flags: fieldData.flags || 0,
      type: fieldData.type || FieldType.Text,
      name: fieldData.name,
      domain: fieldData.domain,
      variants: fieldData.variants,
      showUserLevel: fieldData.showUserLevel
    });

    return field;
  }

  async updateField(id: number, fieldData: ServerField.Entity) {
    const field = await fieldRepository.updateById(id, fieldData);
    return field
  }

  async deleteField(id: number) {
    const field = await fieldRepository.deleteById(id);
    return field
  }

  async getField(id: number) {
    const field = await fieldRepository.findById(id);
    return field;
  }

  async getFieldsByDomain(domain: FieldDomains) {
    const fields = await fieldRepository.find({ domain: [`${domain}`] });
    return fields;
  }
}

export = new FieldService();
