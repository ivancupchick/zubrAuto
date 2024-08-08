import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
// import mailService from './mail.service';
import { Models } from '../entities/Models';
import { ServerUser } from '../entities/User';
import { ApiError } from '../exceptions/api.error';
import userRepository from '../repositories/base/user.repository';
import fieldService from './field.service';
import { FieldDomains, ServerField } from '../entities/Field';
import { getFieldsWithValues } from '../utils/field.utils';
import fieldChainService from './field-chain.service';
import { ICrudService } from '../entities/Types';
import roleRepository from '../repositories/base/role.repository';
import { StringHash } from '../models/hashes';
import fieldRepository from '../repositories/base/field.repository';
import { getEntityIdsByNaturalQuery } from '../utils/enitities-functions';

class UserService implements ICrudService<ServerUser.CreateRequest, ServerUser.UpdateRequest, ServerUser.Response, ServerUser.IdResponse> {
  async getUsers(users: Models.User[], usersFields: ServerField.Response[]) {
    if (users.length === 0) {
      return [];
    }

    const chaines = await fieldChainService.find({
      sourceName: [`${Models.Table.Users}`],
      sourceId: users.map(c => `${c.id}`),
    });

    const customRoles = await roleRepository.getAll();

    const result: ServerUser.Response[] = users.map(user => ({
      id: user.id,
      email: user.email,
      password: user.password,
      isActivated: user.isActivated,
      activationLink: user.activationLink,
      roleLevel: user.roleLevel,
      deleted: user.deleted,
      customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
      fields: getFieldsWithValues(usersFields, chaines, user.id)
    }))

    return result;
  }

  async getAll() {
    const [
      users,
      relatedFields
    ] = await Promise.all([
      userRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.User)
    ]);

    let list = await this.getUsers(users, relatedFields);

    return {
      list: list,
      total: users.length
    };
  }

  async getUsersByQuery(query: StringHash) {
    const {
      page,
      size,
      sortOrder,
      sortField,
    } = query;
    delete query['page'];
    delete query['size'];
    delete query['sortOrder'];
    delete query['sortField'];

    const naturalFields = [
      'email',
      'password',
      'isActivated',
      'activationLink',
      'roleLevel',
      'deleted',
    ];

    let naturalQuery = {};

    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (naturalFields.includes(key)) {
          naturalQuery[key] = query[key];
          delete query[key];
        }
      }
    }

    if (sortField && sortOrder && naturalFields.includes(sortField)) {
      naturalQuery = {
        ...naturalQuery,
        sortField,
        sortOrder
      }
    }

    const searchUsersIds = Object.values(naturalQuery).length ? await fieldChainService.getEntityIdsByQuery(
      Models.Table.Users,
      FieldDomains.User,
      query
    ) : [];

    const naturalSearchUsersIds = Object.values(naturalQuery).length || (sortField && naturalFields.includes(sortField)) ? await getEntityIdsByNaturalQuery(
      userRepository,
      naturalQuery
    ) : [];

    let usersIds = [...searchUsersIds];

    if (searchUsersIds.length && naturalSearchUsersIds.length) {
      usersIds = searchUsersIds.filter(id => naturalSearchUsersIds.includes(id));
    }
    if (!searchUsersIds.length && naturalSearchUsersIds.length) {
      usersIds = [...naturalSearchUsersIds];
    }

    if (sortField && sortOrder && !naturalFields.includes(sortField)) {
      const sortFieldConfig = await fieldRepository.findOne({
        name: [sortField]
      });

      if (sortFieldConfig && searchUsersIds.length) {
        const sortChaines = await fieldChainService.find({
          fieldId: [`${sortFieldConfig.id}`],
          sourceId: searchUsersIds,
          sourceName: [Models.Table.Users],
        }, sortOrder);

        usersIds = sortChaines.map(ch => `${ch.sourceId}`);
      }
    }

    if (page && size) {
      const start = (+page - 1) * +size;

      usersIds = usersIds.slice(start, start + +size);
    }

    const users = usersIds.length > 0 ? await userRepository.find({
      id: usersIds
    }) : [];

    const [
      usersFields,
    ] = await Promise.all([
      fieldService.getFieldsByDomain(FieldDomains.User),
    ]);

    let list = await this.getUsers(users, usersFields);;

    // if (sortOrder === 'DESC') {
    //   list = list.reverse();
    // }

    return {
      list: list,
      total: searchUsersIds.length
    };
  }

  async create(userData: ServerUser.CreateRequest) {
    const existUser = await userRepository.findOne({ email: [userData.email] })
    if (existUser) {
      throw ApiError.BadRequest(`User with ${userData.email} exists`); // Error codes
    }

    const activationLink = v4();
    userData.password = await bcrypt.hash(userData.password, 3)
    if (!userData.isActivated) {
      userData = Object.assign({}, userData, { activationLink });
    }

    const fields = [...userData.fields];
    delete userData.fields;
    const user: Models.User = await userRepository.create(userData);
    await Promise.all(fields.map(f => fieldChainService.create({
      sourceId: user.id,
      fieldId: f.id,
      value: f.value,
      sourceName: Models.Table.Users
    })))

    if (!userData.isActivated) {
      // await mailService.sendActivationMail(userData.email, `${process.env.API_URL}/activate/`+activationLink); // need test
    }

    return user;
  }

  async update(id: number, userData: ServerUser.UpdateRequest) { // TODO deleting userTokens
    if (userData.password) {
      userData.password = await bcrypt.hash(userData.password, 3)
    }

    const fields = [...userData.fields];
    delete userData.fields;
    const user = await userRepository.updateById(id, userData);

    const existsFieldChains = (await Promise.all(fields.map(f => fieldChainService.find({
      fieldId: [f.id].map(c => `${c}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.Table.Users]
    })))).reduce((prev, cur) => [...prev, ...cur], []);
    const existFieldIds = existsFieldChains.map(ef => +ef.fieldId);

    const existsFields = fields.filter(f => existFieldIds.includes(+f.id));
    const nonExistFields = fields.filter(f => !existFieldIds.includes(+f.id));

    existsFields.length > 0 && await Promise.all(existsFields.map(f => fieldChainService.update({
      value: f.value
    }, {
      fieldId: [f.id].map(c => `${c}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.Table.Users]
    })));

    nonExistFields.length > 0 && await Promise.all(nonExistFields.map(f => fieldChainService.create({
      fieldId: f.id,
      sourceId: id,
      sourceName: Models.Table.Users,
      value: f.value,
    })));

    return user
  }

  async delete(id: number) { // TODO deleting userTokens
    // await fieldChainService.delete({
    //   sourceName: [Models.Table.Users],
    //   sourceId: [`${id}`],
    // });

    // const user = await userRepository.deleteById(id);

    const user = await userRepository.updateById(id, { deleted: 1 as any });

    return user
  }

  async get(id: number) {
    const user = await userRepository.findById(id);
    const relatedFields = await fieldService.getFieldsByDomain(FieldDomains.User);
    const chaines = await fieldChainService.find({
      sourceName: [`${Models.Table.Users}`],
      sourceId: [`${id}`],
    });

    const customRoles = await roleRepository.getAll();

    const result: ServerUser.Response = {
      id: user.id,
      email: user.email,
      isActivated: user.isActivated,
      deleted: user.deleted,
      roleLevel: user.roleLevel,
      customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
      fields: getFieldsWithValues(relatedFields, chaines, user.id)
    };

    return result;
  }
}

export = new UserService();
