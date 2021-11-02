import bcrypt from 'bcrypt';
import { v4 } from 'uuid';
import mailService from './mail.service';
import { Models } from '../entities/Models';
import { ServerUser, SystemRole } from '../entities/User';
import { ApiError } from '../exceptions/api.error';
import userRepository from '../repositories/base/user.repository';
import fieldService from './field.service';
import { FieldDomains } from '../entities/Field';
import fieldChainRepository from '../repositories/base/field-chain.repository';
import { getFieldsWithValues } from '../utils/field.utils';
import fieldChainService from './field-chain.service';

class UserService {
  // replace to other service
  async getAllUsers() {
    const [
      users,
      relatedFields
    ] = await Promise.all([
      userRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.User)
    ]);

    const chaines = await fieldChainRepository.find({
      sourceId: users.map(c => `${c.id}`),
      sourceName: [`${Models.USERS_TABLE_NAME}`]
    });

    const result: ServerUser.GetResponse[] = users.map(user => ({
      id: user.id,
      email: user.email,
      password: user.password,
      isActivated: user.isActivated,
      activationLink: user.activationLink,
      roleLevel: user.roleLevel,
      fields: getFieldsWithValues(relatedFields, chaines, user.id)
    }))

    return result;
  }

  async createUser(userData: ServerUser.CreateRequest) {
    const existUser = await userRepository.findOne({ email: [userData.email] })
    if (existUser) {
      throw ApiError.BadRequest(`User with ${userData.email} exists`); // Error codes
    }

    const hashPassword = await bcrypt.hash(userData.password, 3)
    const activationLink = v4();
    const user: Models.User = await userRepository.create({
      id: 0, // will be deleted in DAO
      email: userData.email,
      isActivated: true,
      password: hashPassword,
      activationLink: !userData.isActivated ? activationLink : '',
      roleLevel: userData.roleLevel || SystemRole.None,
    });

    await Promise.all(userData.fields.map(f => fieldChainService.createFieldChain({
      id: 0,
      sourceId: user.id,
      fieldId: f.id,
      value: f.value,
      sourceName: Models.USERS_TABLE_NAME
    })))

    if (!userData.isActivated) {
      await mailService.sendActivationMail(userData.email, `${process.env.API_URL}/activate/`+activationLink); // need test
    }

    return user;
  }

  async updateUser(id: number, userData: ServerUser.UpdateRequest) { // TODO deleting userTokens
    let hashPassword = '';

    if (userData.password) {
      hashPassword = await bcrypt.hash(userData.password, 3)
    }

    const updatedUserData: Models.User = {
      id: 0, // will be deleted in DAO
      email: userData.email,
      isActivated: true,
      roleLevel: userData.roleLevel || SystemRole.None,
    } as Models.User;

    if (hashPassword) {
      updatedUserData.password = hashPassword;
    }

    const user = await userRepository.updateById(id, updatedUserData);

    await Promise.all(userData.fields.map(f => fieldChainRepository.update({
      value: f.value
    }, {
      fieldId: [f.id].map(c => `${c}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.USERS_TABLE_NAME]
    })))

    return user
  }

  async deleteUser(id: number) { // TODO deleting userTokens
    const chaines = await fieldChainRepository.find({
      sourceId: [`${id}`],
      sourceName: [Models.USERS_TABLE_NAME]
    });
    await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
    const user = await userRepository.deleteById(id);
    return user
  }

  async getUser(id: number) {
    const user = await userRepository.findById(id);
    const relatedFields = await fieldService.getFieldsByDomain(FieldDomains.User);
    const chaines = await fieldChainRepository.find({
      sourceId: [`${id}`],
      sourceName: [`${Models.USERS_TABLE_NAME}`]
    });

    const result: ServerUser.GetResponse = {
      id: user.id,
      email: user.email,
      isActivated: user.isActivated,
      roleLevel: user.roleLevel,
      fields: getFieldsWithValues(relatedFields, chaines, user.id)
    };

    return result;
  }
}

export = new UserService();
