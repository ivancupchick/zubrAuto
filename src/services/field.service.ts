import { Models } from '../entities/Models';
import { FieldDomains, FieldType, ServerField } from '../entities/Field';
import { ApiError } from '../exceptions/api.error';
import fieldRepository from '../repositories/base/field.repository';
import carRepository from '../repositories/base/car.repository';
import userRepository from '../repositories/base/user.repository';
import carOwnerRepository from '../repositories/base/car-owner.repository';
import clientRepository from '../repositories/base/client.repository';
import fieldChainService from './field-chain.service';
import fieldChainRepository from '../repositories/base/field-chain.repository';

class FieldService {
  async getAllFields() {
    const fields = await fieldRepository.getAll();
    return fields;
  }

  async createField(fieldData: ServerField.CreateRequest) {
    const existField = await fieldRepository.findOne({ name: [fieldData.name], domain: [`${fieldData.domain}`] })
    if (existField) {
      throw ApiError.BadRequest(`Field ${fieldData.name} exists`);
    }

    const field: Models.Field = await fieldRepository.create({
      id: 0, // will be deleted in DAO
      flags: fieldData.flags || 0,
      type: fieldData.type || FieldType.Text,
      name: fieldData.name.toLowerCase(),
      domain: fieldData.domain,
      variants: fieldData.variants,
      showUserLevel: fieldData.showUserLevel
    });

    let tableName = '';
    let entities: { id: number }[] = [];
    switch (field.domain) {
      case FieldDomains.Car:
        tableName = Models.CARS_TABLE_NAME
        entities = await carRepository.getAll();
        break;
      case FieldDomains.User:
        tableName = Models.USERS_TABLE_NAME
        entities = await userRepository.getAll();
        break;
      case FieldDomains.CarOwner:
        tableName = Models.CAR_OWNERS_TABLE_NAME
        entities = await carOwnerRepository.getAll();
        break;
      case FieldDomains.Client:
        tableName = Models.CLIENTS_TABLE_NAME
        entities = await clientRepository.getAll();
        break;
    }

    await Promise.all(entities.map(entity => fieldChainService.createFieldChain({
      id: 0,
      sourceId: entity.id,
      fieldId: field.id,
      value: '',
      sourceName: tableName
    })))

    return field;
  }

  async updateField(id: number, fieldData: ServerField.Entity) {
    const field = await fieldRepository.updateById(id, fieldData);
    return field
  }

  async deleteField(id: number) {
    const field = await fieldRepository.deleteById(id);

    let tableName = '';
    let entities: { id: number }[] = [];
    switch (field.domain) {
      case FieldDomains.Car:
        tableName = Models.CARS_TABLE_NAME
        entities = await carRepository.getAll();
        break;
      case FieldDomains.User:
        tableName = Models.USERS_TABLE_NAME
        entities = await userRepository.getAll();
        break;
      case FieldDomains.CarOwner:
        tableName = Models.CAR_OWNERS_TABLE_NAME
        entities = await carOwnerRepository.getAll();
        break;
      case FieldDomains.Client:
        tableName = Models.CLIENTS_TABLE_NAME
        entities = await clientRepository.getAll();
        break;
    }

    await Promise.all(entities.map(entity => fieldChainRepository.deleteOne({
      sourceId: [`${entity.id}`],
      fieldId: [`${field.id}`],
      sourceName: [`${tableName}`]
    })))

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
