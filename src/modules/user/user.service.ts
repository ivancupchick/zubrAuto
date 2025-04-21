import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Models } from 'src/temp/entities/Models';
import { BaseList } from 'src/temp/entities/Types';
import { StringHash } from 'src/temp/models/hashes';
import { getFieldsWithValues } from 'src/core/utils/field.utils';
import { ServerUser } from 'src/temp/entities/User';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldChainService } from 'src/core/fields/services/field-chain.service';
import { ServerField } from 'src/temp/entities/Field';
import { FieldsService } from 'src/core/fields/fields.service';
import { FieldDomains } from 'src/core/fields/fields';
import { getEntityIdsByNaturalQuery } from 'src/core/utils/enitities-functions';
import { Prisma } from '@prisma/client';
import { ApiError } from 'src/core/exceptions/api.error';
import { v4 } from 'uuid';
import { hash } from 'bcryptjs';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private fieldChainService: FieldChainService,
    private fieldsService: FieldsService,
  ) {}
  async getUsers(users: Models.User[], usersFields: ServerField.Response[]) {
    if (users.length === 0) {
      return [];
    }

    const chaines = await this.fieldChainService.findMany({
      sourceName: Models.Table.Users,
      sourceId: { in: users.map((c) => c.id) },
    });

    const customRoles = await this.prisma.roles.findMany();

    const result: ServerUser.Response[] = users.map((user) => ({
      id: user.id,
      email: user.email,
      password: user.password,
      isActivated: user.isActivated,
      activationLink: user.activationLink,
      roleLevel: user.roleLevel,
      deleted: user.deleted,
      customRoleName:
        customRoles.find((cr) => cr.id + 1000 === user.roleLevel)?.systemName ||
        '',
      fields: getFieldsWithValues(usersFields, chaines, user.id),
    }));

    return result;
  }

  async findAll(): Promise<BaseList<ServerUser.Response>> {
    const [users, relatedFields] = await Promise.all([
      this.prisma.users.findMany(),
      this.fieldsService.getFieldsByDomain(FieldDomains.User),
    ]);

    let list = await this.getUsers(users, relatedFields);

    return {
      list: list,
      total: users.length,
    };
  }

  async findMany(query: StringHash): Promise<BaseList<ServerUser.Response>> {
    const { page, size, sortOrder, sortField } = query;
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
        sortOrder,
      };
    }

    const searchUsersIds = (
      Object.values(naturalQuery).length
        ? await this.fieldChainService.getEntityIdsByQuery(
            Models.Table.Users,
            FieldDomains.User,
            query,
          )
        : []
    ).map((id) => +id);

    const naturalSearchUsersIds =
      Object.values(naturalQuery).length ||
      (sortField && naturalFields.includes(sortField))
        ? await getEntityIdsByNaturalQuery(this.prisma.users, naturalQuery)
        : [];

    let usersIds = [...searchUsersIds].map((id) => +id);

    if (searchUsersIds.length && naturalSearchUsersIds.length) {
      usersIds = searchUsersIds
        .filter((id) => naturalSearchUsersIds.includes(id))
        .map((id) => +id);
    }
    if (!searchUsersIds.length && naturalSearchUsersIds.length) {
      usersIds = [...naturalSearchUsersIds];
    }

    if (sortField && sortOrder && !naturalFields.includes(sortField)) {
      const sortFieldConfig = await this.prisma.fields.findFirst({
        where: {
          name: sortField,
        },
      });

      if (sortFieldConfig && searchUsersIds.length) {
        const sortChaines = await this.fieldChainService.findMany(
          {
            fieldId: sortFieldConfig.id,
            sourceId: { in: searchUsersIds.map((id) => +id) },
            sourceName: Models.Table.Users,
          },
          sortOrder.toLowerCase() as Prisma.SortOrder,
        );

        usersIds = sortChaines.map((ch) => ch.sourceId);
      }
    }

    if (page && size) {
      const start = (+page - 1) * +size;

      usersIds = usersIds.slice(start, start + +size);
    }

    const users =
      usersIds.length > 0
        ? await this.prisma.users.findMany({
            where: {
              id: { in: usersIds.map((id) => +id) },
            },
          })
        : [];

    const [usersFields] = await Promise.all([
      this.fieldsService.getFieldsByDomain(FieldDomains.User),
    ]);

    let list = await this.getUsers(users, usersFields);

    // if (sortOrder === Prisma.SortOrder.desc) {
    //   list = list.reverse();
    // }

    return {
      list: list,
      total: searchUsersIds.length,
    };
  }

  async create(createUserDto: CreateUserDto) {
    const existUser = await this.prisma.users.findFirst({
      where: { email: createUserDto.email },
    });
    if (existUser) {
      throw ApiError.BadRequest(`User with ${createUserDto.email} exists`); // Error codes
    }

    const activationLink = v4();
    createUserDto.password = await hash(createUserDto.password, 3);
    if (!createUserDto.isActivated) {
      createUserDto = Object.assign({}, createUserDto, { activationLink });
    }

    const fields = [...createUserDto.fields];
    delete createUserDto.fields;
    const user: Models.User = await this.prisma.users.create({
      data: createUserDto,
    });
    await Promise.all(
      fields.map((f) =>
        this.fieldChainService.create({
          sourceId: user.id,
          fieldId: f.id,
          value: f.value,
          sourceName: Models.Table.Users,
        }),
      ),
    );

    if (!createUserDto.isActivated) {
      // await mailService.sendActivationMail(userData.email, `${process.env.API_URL}/activate/`+activationLink); // need test
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    // TODO deleting userTokens
    if (updateUserDto.password) {
      updateUserDto.password = await hash(updateUserDto.password, 3);
    }

    const fields = [...updateUserDto.fields];
    delete updateUserDto.fields;
    const user = await this.prisma.users.update({
      where: { id: id },
      data: updateUserDto,
    });

    const existsFieldChains = (
      await Promise.all(
        fields.map((f) =>
          this.fieldChainService.findMany({
            fieldId: f.id,
            sourceId: id,
            sourceName: Models.Table.Users,
          }),
        ),
      )
    ).reduce((prev, cur) => [...prev, ...cur], []);
    const existFieldIds = existsFieldChains.map((ef) => +ef.fieldId);

    const existsFields = fields.filter((f) => existFieldIds.includes(+f.id));
    const nonExistFields = fields.filter((f) => !existFieldIds.includes(+f.id));

    existsFields.length > 0 &&
      (await Promise.all(
        existsFields.map((f) =>
          this.fieldChainService.update(
            {
              value: f.value,
            },
            {
              fieldId: f.id,
              sourceId: id,
              sourceName: Models.Table.Users,
            },
          ),
        ),
      ));

    nonExistFields.length > 0 &&
      (await Promise.all(
        nonExistFields.map((f) =>
          this.fieldChainService.create({
            fieldId: f.id,
            sourceId: id,
            sourceName: Models.Table.Users,
            value: f.value,
          }),
        ),
      ));

    return user;
  }

  async remove(id: number) {
    // TODO deleting userTokens
    // await fieldChainService.delete({
    //   sourceName: [Models.Table.Users],
    //   sourceId: [`${id}`],
    // });

    // const user = await this.prisma.users.deleteById(id);

    const user = await this.prisma.users.update({
      where: { id },
      data: { deleted: true },
    });

    return user;
  }

  async findOne(id: number) {
    const user = await this.prisma.users.findUnique({ where: { id } });
    const relatedFields = await this.fieldsService.getFieldsByDomain(
      FieldDomains.User,
    );
    const chaines = await this.fieldChainService.findMany({
      sourceName: Models.Table.Users,
      sourceId: id,
    });

    const customRoles = await this.prisma.roles.findMany();

    const result: ServerUser.Response = {
      id: user.id,
      email: user.email,
      isActivated: user.isActivated,
      deleted: user.deleted,
      roleLevel: user.roleLevel,
      customRoleName:
        customRoles.find((cr) => cr.id + 1000 === user.roleLevel)?.systemName ||
        '',
      fields: getFieldsWithValues(relatedFields, chaines, user.id),
    };

    return result;
  }
}
