import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
// import mailService from './mail.service';
import { Models } from '../entities/Models';
import { ServerUser } from '../entities/User';
import { ApiError } from '../exceptions/api.error';
import userRepository from '../repositories/base/user.repository';
import fieldService from './field.service';
import { FieldDomains } from '../entities/Field';
import fieldChainRepository from '../repositories/base/field-chain.repository';
import { getFieldsWithValues } from '../utils/field.utils';
import fieldChainService from './field-chain.service';
import { ICrudService } from '../entities/Types';
import roleRepository from '../repositories/base/role.repository';
import { ServerRole } from '../entities/Role';

class UserService implements ICrudService<ServerUser.CreateRequest, ServerUser.UpdateRequest, ServerUser.Response, ServerUser.IdResponse> {
  async getAll(): Promise<ServerUser.Response[]> {
    const [
      users,
      relatedFields
    ] = await Promise.all([
      userRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.User)
    ]);

    const chaines = await fieldChainRepository.find({
      sourceName: [`${Models.USERS_TABLE_NAME}`],
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
      customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
      fields: getFieldsWithValues(relatedFields, chaines, user.id)
    }))

    return result;
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
    await Promise.all(fields.map(f => fieldChainService.createFieldChain({
      sourceId: user.id,
      fieldId: f.id,
      value: f.value,
      sourceName: Models.USERS_TABLE_NAME
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

    await Promise.all(fields.map(f => fieldChainRepository.update({
      value: f.value
    }, {
      fieldId: [f.id].map(c => `${c}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.USERS_TABLE_NAME]
    })))

    return user
  }

  async delete(id: number) { // TODO deleting userTokens
    const chaines = await fieldChainRepository.find({
      sourceName: [Models.USERS_TABLE_NAME],
      sourceId: [`${id}`],
    });
    await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
    const user = await userRepository.deleteById(id);
    return user
  }

  async get(id: number) {
    const user = await userRepository.findById(id);
    const relatedFields = await fieldService.getFieldsByDomain(FieldDomains.User);
    const chaines = await fieldChainRepository.find({
      sourceName: [`${Models.USERS_TABLE_NAME}`],
      sourceId: [`${id}`],
    });

    const customRoles = await roleRepository.getAll();

    const result: ServerUser.Response = {
      id: user.id,
      email: user.email,
      isActivated: user.isActivated,
      roleLevel: user.roleLevel,
      customRoleName: customRoles.find(cr => (cr.id + 1000) === user.roleLevel)?.systemName || '',
      fields: getFieldsWithValues(relatedFields, chaines, user.id)
    };

    return result;
  }
}

export = new UserService();
