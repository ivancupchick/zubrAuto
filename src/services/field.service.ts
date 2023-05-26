import { Models } from '../entities/Models';
import { FieldDomains, FieldType, getDomainByTableName, getTableNameByDomain, ServerField } from '../entities/Field';
import { ApiError } from '../exceptions/api.error';
import fieldRepository from '../repositories/base/field.repository';
import carRepository from '../repositories/base/car.repository';
import userRepository from '../repositories/base/user.repository';
import carOwnerRepository from '../repositories/base/car-owner.repository';
import clientRepository from '../repositories/base/client.repository';
import fieldChainService from './field-chain.service';
import fieldChainRepository from '../repositories/base/field-chain.repository';
import { ICrudService } from '../entities/Types';
import fieldAccessRepository from '../repositories/base/field-access.repository';

class FieldService implements ICrudService<ServerField.CreateRequest, ServerField.UpdateRequest, ServerField.Response, ServerField.IdResponse> {
  async getAll() {
    const [fields, fieldAccesses] = await Promise.all([
      fieldRepository.getAll(),
      fieldAccessRepository.getAll()
    ]);

    const result: ServerField.Response[] = fields.map(field => ({
      ...field,
      accesses: fieldAccesses.filter(fa => fa.fieldId === field.id).map(fa => ({
        id: fa.id,
        fieldId: fa.fieldId,
        sourceId: fa.sourceId,
        domain: getDomainByTableName(fa.sourceName),
        access: fa.access
      })),
    }));

    return result;
  }

  async create(fieldData: ServerField.CreateRequest) {
    const existField = await fieldRepository.findOne({ name: [fieldData.name], domain: [`${fieldData.domain}`] })
    if (existField) {
      throw ApiError.BadRequest(`Field ${fieldData.name} exists`);
    }

    const field: Models.Field = await fieldRepository.create({
      flags: fieldData.flags || 0,
      type: fieldData.type || FieldType.Text,
      name: fieldData.name.toLowerCase(),
      domain: fieldData.domain,
      variants: fieldData.variants,
      showUserLevel: fieldData.showUserLevel
    });

    if (fieldData.accesses) {
      await Promise.all((fieldData.accesses || []).map(a => fieldAccessRepository.create({
        sourceId: a.sourceId,
        fieldId: field.id,
        access: a.access,
        sourceName: getTableNameByDomain(a.domain)
      })))
    }

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

    // await Promise.all(entities.map(entity => fieldChainService.createFieldChain({
    //   sourceId: entity.id,
    //   fieldId: field.id,
    //   value: '',
    //   sourceName: tableName
    // })))

    return field;
  }

  async update(id: number, fieldData: ServerField.UpdateRequest) {
    const accesses = [...fieldData.accesses];
    delete fieldData.accesses;

    if (fieldData.name) {
      fieldData.name === fieldData.name.trim();
    }

    const field: Models.Field = await fieldRepository.updateById(id, fieldData);

    const createdAccess = accesses.length > 0
      ? await fieldAccessRepository.find({
        fieldId: [`${id}`]
      })
      : [];
    const notCreatedAccess = accesses.filter(na => !createdAccess.find((ca => ca.sourceId === na.sourceId && ca.sourceName === getTableNameByDomain(na.domain))));

    await Promise.all(
      createdAccess
        .map(a => {
          const newAccess = accesses.find(na => na.sourceId === a.sourceId && getTableNameByDomain(na.domain) === a.sourceName);
          const newAccessValue: number | null = !!newAccess ? newAccess.access : null;

          switch (newAccessValue) {
            case null: return fieldAccessRepository.deleteById(a.id);
            case 0: return fieldAccessRepository.deleteById(a.id);
          }

          return fieldAccessRepository.updateById(a.id, { access: newAccessValue })
        })
        .filter(a => a)
    )

    await Promise.all(
      notCreatedAccess
        .map(na => fieldAccessRepository.create({
          sourceId: na.sourceId,
          fieldId: id,
          access: na.access,
          sourceName: getTableNameByDomain(na.domain)
        }))
    )

    // const field = await fieldRepository.updateById(id, fieldData);
    return field
  }

  async delete(id: number) {
    const field = await fieldRepository.findById(id);

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

    const createdAccess = (await fieldAccessRepository.find({
      fieldId: [`${id}`]
    })) || [];

    const fieldIds = await fieldChainRepository.find({
      // maybe need to add sourceName
      sourceId: entities.map(e => `${e.id}`),
      fieldId: [`${field.id}`],
    });

    await Promise.all([
      ...fieldIds.map(fieldChain => fieldChainRepository.deleteById(fieldChain.id)),
    ]);

    await Promise.all([
      ...createdAccess.map(a => fieldAccessRepository.deleteById(a.id))
    ]);

    await fieldRepository.deleteById(id);
    return field
  }

  async get(id: number) {
    const [field, fieldAccesses] = await Promise.all([
      fieldRepository.findById(id),
      fieldAccessRepository.getAll()
    ]);

    const result = {
      ...field,
      accesses: fieldAccesses.filter(fa => fa.fieldId === field.id).map(fa => ({
        id: fa.id,
        fieldId: fa.fieldId,
        sourceId: fa.sourceId,
        domain: getDomainByTableName(fa.sourceName),
        access: fa.access
      })),
    };

    return result;
  }

  async getFieldsByDomain(domain: FieldDomains): Promise<ServerField.Response[]> {
    const [fields, fieldAccesses] = await Promise.all([
      fieldRepository.find({ domain: [`${domain}`] }),
      fieldAccessRepository.getAll()
    ]);

    const result = fields.map(field => ({
      ...field,
      accesses: fieldAccesses.filter(fa => fa.fieldId === field.id).map(fa => ({
        id: fa.id,
        fieldId: fa.fieldId,
        sourceId: fa.sourceId,
        domain: getDomainByTableName(fa.sourceName),
        access: fa.access
      })),
    }));

    return result;
  }
}

export = new FieldService();
