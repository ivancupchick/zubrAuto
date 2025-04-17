import { Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ServerRole } from 'src/temp/entities/Role';
import { Models } from 'src/temp/entities/Models';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const role = await this.prisma.roles.create({ data: {
      systemName: createRoleDto.systemName
    }});

    await Promise.all((createRoleDto.accesses || []).map(a => this.prisma.fieldAccesses.create({ data: {
      sourceId: role.id,
      fieldId: a.fieldId,
      access: a.access,
      sourceName: Models.Table.Roles
    }})))

    return role;
  }

  async findAll() {
    const [
      roles,
      fieldAccesses
    ] = await Promise.all([
      this.prisma.roles.findMany(),
      this.prisma.fieldAccesses.findMany({ where: { sourceName: Models.Table.Roles }})
    ]);

    const result: ServerRole.Response[] = roles.map(role => ({
      id: role.id,
      systemName: role.systemName,
      accesses: fieldAccesses.filter(fa => fa.sourceId === role.id)
    }))

    return result;
  }

  async findOne(id: number) {
    const [
      role,
      fieldAccesses
    ] = await Promise.all([
      this.prisma.roles.findUnique({ where: { id }}),
      this.prisma.fieldAccesses.findMany({ where: { sourceName: Models.Table.Roles }})
    ]);

    const result: ServerRole.Response = {
      id: role.id,
      systemName: role.systemName,
      accesses: fieldAccesses.filter(fa => fa.sourceId === role.id)
    };

    return result;
  }

  async update(id: number, updateRoleDto: UpdateRoleDto) {
    const role = await this.prisma.roles.update({ where: {id}, data: {
      systemName: updateRoleDto.systemName
    }});

    const createdAccess: Models.FieldAccess[] = updateRoleDto.accesses.length > 0 ? await this.prisma.fieldAccesses.findMany({ where: {
      fieldId: { in: updateRoleDto.accesses.map(c => c.fieldId)},
      sourceId: id,
      sourceName: Models.Table.Roles
    }}) : [];
    const notCreatedAccess = updateRoleDto.accesses.filter(a => createdAccess.find((ca => ca.fieldId === a.fieldId)));

    await Promise.all((createdAccess || []).map(a => this.prisma.fieldAccesses.updateMany({ data: {
      access: a.access
    },where: {
      fieldId: a.fieldId,
      sourceId: id,
      sourceName: Models.Table.Roles
    }})))

    await Promise.all((notCreatedAccess || []).map(a => this.prisma.fieldAccesses.create({ data:{
      sourceId: id,
      fieldId: a.fieldId,
      access: a.access,
      sourceName: Models.Table.Roles
    }})))

    return role
  }

  async remove(id: number) {
    const accesses = await this.prisma.fieldAccesses.findMany({ where: {
      sourceId: id,
      sourceName: Models.Table.Roles
    }})
    await Promise.all(accesses.map(a => this.prisma.fieldAccesses.delete({where:{ id: a.id}})));
    const role = await this.prisma.roles.delete({where:{ id}});
    return role
  }
}
