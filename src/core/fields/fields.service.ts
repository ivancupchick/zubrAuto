import { Injectable } from '@nestjs/common';
import { CreateFieldDto } from './dto/create-field.dto';
import { UpdateFieldDto } from './dto/update-field.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldDomains, FieldType, getDomainByTableName } from './fields';
import { getTableNameByDomain, ServerField } from 'src/temp/entities/Field';
import { ApiError } from 'src/core/exceptions/api.error';
import { Models } from 'src/temp/entities/Models';
import { FieldChainService } from './services/field-chain.service';

@Injectable()
export class FieldsService {
  constructor(
    private prisma: PrismaService,
    private fieldChainService: FieldChainService,
  ) {}

  async create(createFieldDto: CreateFieldDto) {
    const existField = await this.prisma.fields.findFirst({
      where: { name: createFieldDto.name, domain: createFieldDto.domain },
    });
    if (existField) {
      throw ApiError.BadRequest(`Field ${createFieldDto.name} exists`);
    }

    const field: Models.Field = await this.prisma.fields.create({
      data: {
        flags: createFieldDto.flags || 0,
        type: createFieldDto.type || FieldType.Text,
        name: createFieldDto.name.toLowerCase(),
        domain: createFieldDto.domain,
        variants: createFieldDto.variants,
        showUserLevel: createFieldDto.showUserLevel,
      },
    });

    if (createFieldDto.accesses) {
      await Promise.all(
        (createFieldDto.accesses || []).map((a) =>
          this.prisma.fieldAccesses.create({
            data: {
              sourceId: a.sourceId,
              fieldId: field.id,
              access: a.access,
              sourceName: getTableNameByDomain(a.domain),
            },
          }),
        ),
      );
    }

    // let tableName = '';
    // let entities: { id: number }[] = [];
    // switch (field.domain) {
    //   case FieldDomains.Car:
    //     tableName = Models.Table.Cars
    //     entities = await carRepository.getAll();
    //     break;
    //   case FieldDomains.User:
    //     tableName = Models.Table.Users
    //     entities = await userRepository.getAll();
    //     break;
    //   case FieldDomains.CarOwner:
    //     tableName = Models.Table.CarOwners
    //     entities = await carOwnerRepository.getAll();
    //     break;
    //   case FieldDomains.Client:
    //     tableName = Models.Table.Clients
    //     entities = await clientRepository.getAll();
    //     break;
    // }

    // await Promise.all(entities.map(entity => fieldChainService.createFieldChain({
    //   sourceId: entity.id,
    //   fieldId: field.id,
    //   value: '',
    //   sourceName: tableName
    // })))

    return field;
  }

  async findAll() {
    const [fields, fieldAccesses] = await Promise.all([
      this.prisma.fields.findMany(),
      this.prisma.fieldAccesses.findMany(),
    ]);

    const result: ServerField.Response[] = fields.map((field) => ({
      ...field,
      accesses: fieldAccesses
        .filter((fa) => fa.fieldId === field.id)
        .map((fa) => ({
          id: fa.id,
          fieldId: fa.fieldId,
          sourceId: fa.sourceId,
          domain: getDomainByTableName(fa.sourceName),
          access: fa.access,
        })),
    }));

    return result; // TODO BaseList
  }

  async findOne(id: number) {
    const [field, fieldAccesses] = await Promise.all([
      this.prisma.fields.findUnique({ where: { id } }),
      this.prisma.fieldAccesses.findMany(),
    ]);

    const result = {
      ...field,
      accesses: fieldAccesses
        .filter((fa) => fa.fieldId === field.id)
        .map((fa) => ({
          id: fa.id,
          fieldId: fa.fieldId,
          sourceId: fa.sourceId,
          domain: getDomainByTableName(fa.sourceName),
          access: fa.access,
        })),
    };

    return result;
  }

  async update(id: number, updateFieldDto: UpdateFieldDto) {
    const accesses = [...updateFieldDto.accesses];
    delete updateFieldDto.accesses;

    if (updateFieldDto.name) {
      updateFieldDto.name === updateFieldDto.name.trim();
    }

    const field: Models.Field = await this.prisma.fields.update({
      where: { id },
      data: updateFieldDto,
    });

    const createdAccess =
      accesses.length > 0
        ? await this.prisma.fieldAccesses.findMany({
            where: {
              fieldId: id,
            },
          })
        : [];
    const notCreatedAccess = accesses.filter(
      (na) =>
        !createdAccess.find(
          (ca) =>
            ca.sourceId === na.sourceId &&
            ca.sourceName === getTableNameByDomain(na.domain),
        ),
    );

    await Promise.all(
      createdAccess
        .map((a) => {
          const newAccess = accesses.find(
            (na) =>
              na.sourceId === a.sourceId &&
              getTableNameByDomain(na.domain) === a.sourceName,
          );
          const newAccessValue: number | null = !!newAccess
            ? newAccess.access
            : null;

          switch (newAccessValue) {
            case null:
              return this.prisma.fieldAccesses.delete({ where: { id: a.id } });
            case 0:
              return this.prisma.fieldAccesses.delete({ where: { id: a.id } });
          }

          return this.prisma.fieldAccesses.update({
            where: { id: a.id },
            data: { access: newAccessValue },
          });
        })
        .filter((a) => a),
    );

    await Promise.all(
      notCreatedAccess.map((na) =>
        this.prisma.fieldAccesses.create({
          data: {
            sourceId: na.sourceId,
            fieldId: id,
            access: na.access,
            sourceName: getTableNameByDomain(na.domain),
          },
        }),
      ),
    );

    // const field = await fieldRepository.updateById(id, updateFieldDto);
    return field;
  }

  async remove(id: number) {
    const field = await this.prisma.fields.findUnique({ where: { id } });

    let tableName = '';
    let entities: { id: number }[] = [];
    switch (field.domain) {
      case FieldDomains.Car:
        tableName = Models.Table.Cars;
        entities = await this.prisma.cars.findMany();
        break;
      case FieldDomains.User:
        tableName = Models.Table.Users;
        entities = await this.prisma.users.findMany();
        break;
      case FieldDomains.CarOwner:
        tableName = Models.Table.CarOwners;
        entities = await this.prisma.carOwners.findMany();
        break;
      case FieldDomains.Client:
        tableName = Models.Table.Clients;
        entities = await this.prisma.clients.findMany();
        break;
    }

    const createdAccess =
      (await this.prisma.fieldAccesses.findMany({
        where: {
          fieldId: id,
        },
      })) || [];

    await this.fieldChainService.deleteMany({
      // maybe need to add sourceName
      sourceId: { in: entities.map((e) => e.id) },
      fieldId: field.id,
    });

    await Promise.all([
      ...createdAccess.map((a) =>
        this.prisma.fieldAccesses.delete({ where: { id: a.id } }),
      ),
    ]);

    await this.prisma.fields.delete({ where: { id } });
    return field;
  }

  async getFieldsByDomain(domain: FieldDomains) {
    const [fields, fieldAccesses] = await Promise.all([
      this.prisma.fields.findMany({ where: { domain: +domain } }),
      this.prisma.fieldAccesses.findMany(),
    ]);

    const result = fields.map((field) => ({
      ...field,
      accesses: fieldAccesses
        .filter((fa) => fa.fieldId === field.id)
        .map((fa) => ({
          id: fa.id,
          fieldId: fa.fieldId,
          sourceId: fa.sourceId,
          domain: getDomainByTableName(fa.sourceName), // !TODO wehat is this
          access: fa.access,
        })),
    }));

    return result;
  }
}
