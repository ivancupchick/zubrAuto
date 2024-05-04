import { ServerRole } from "../entities/Role";
import { Models } from "../entities/Models";
import roleRepository from "../repositories/base/role.repository";
import fieldAccessRepository from "../repositories/base/field-access.repository";
import { ICrudService } from "../entities/Types";

class RoleService implements ICrudService<ServerRole.CreateRequest, ServerRole.UpdateRequest, ServerRole.Response, ServerRole.IdResponse> {
  async getAll() {
    const [
      roles,
      fieldAccesses
    ] = await Promise.all([
      roleRepository.getAll(),
      fieldAccessRepository.find({ sourceName: [`${Models.Table.Roles}`] })
    ]);

    const result: ServerRole.Response[] = roles.map(role => ({
      id: role.id,
      systemName: role.systemName,
      accesses: fieldAccesses.filter(fa => fa.sourceId === role.id && fa.sourceName === `${Models.Table.Roles}`)
    }))

    return result;
  }

  async get(id: number) {
    const [
      role,
      fieldAccesses
    ] = await Promise.all([
      roleRepository.findById(id),
      fieldAccessRepository.find({ sourceName: [`${Models.Table.Roles}`] })
    ]);

    const result: ServerRole.Response = {
      id: role.id,
      systemName: role.systemName,
      accesses: fieldAccesses.filter(fa => fa.sourceId === role.id && fa.sourceName === `${Models.Table.Roles}`)
    };

    return result;
  }

  async create(roleData: ServerRole.CreateRequest) {
    const role = await roleRepository.create({
      systemName: roleData.systemName
    });

    await Promise.all((roleData.accesses || []).map(a => fieldAccessRepository.create({
      sourceId: role.id,
      fieldId: a.fieldId,
      access: a.access,
      sourceName: Models.Table.Roles
    })))

    return role;
  }

  async update(id: number, roleData: ServerRole.UpdateRequest) {
    const role = await roleRepository.updateById(id, {
      systemName: roleData.systemName
    });

    const createdAccess = roleData.accesses.length > 0 ? await fieldAccessRepository.find({
      fieldId: roleData.accesses.map(c => `${c.fieldId}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.Table.Roles]
    }) : [];
    const notCreatedAccess = roleData.accesses.filter(a => createdAccess.find((ca => ca.fieldId === a.fieldId)));

    await Promise.all((createdAccess || []).map(a => fieldAccessRepository.update({
      access: a.access
    }, {
      fieldId: [a.fieldId].map(c => `${c}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.Table.Roles]
    })))

    await Promise.all((notCreatedAccess || []).map(a => fieldAccessRepository.create({
      sourceId: id,
      fieldId: a.fieldId,
      access: a.access,
      sourceName: Models.Table.Roles
    })))

    return role
  }

  async delete(id: number) {
    const accesses = await fieldAccessRepository.find({
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.Table.Roles]
    })
    await Promise.all(accesses.map(a => fieldAccessRepository.deleteById(a.id)));
    const role = await roleRepository.deleteById(id);
    return role
  }
}

export = new RoleService();
