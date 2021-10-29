import { ServerRole } from "../entities/Role";
import { Models } from "../entities/Models";
import roleRepository from "../repositories/base/role.repository";
import fieldAccessRepository from "../repositories/base/field-access.repository";

class RoleService {
  async getAllRoles(): Promise<ServerRole.GetResponse[]> {
    const [
      roles,
      fieldAccesses
    ] = await Promise.all([
      roleRepository.getAll(),
      fieldAccessRepository.find({ sourceName: [`${Models.ROLES_TABLE_NAME}`] })
    ]);

    const result: ServerRole.GetResponse[] = roles.map(role => ({
      id: role.id,
      systemName: role.systemName,
      accesses: fieldAccesses.filter(fa => fa.sourceId === role.id && fa.sourceName === `${Models.ROLES_TABLE_NAME}`)
    }))

    return result;
  }

  async getRole(id: number): Promise<ServerRole.GetResponse> {
    const [
      role,
      fieldAccesses
    ] = await Promise.all([
      roleRepository.findById(id),
      fieldAccessRepository.find({ sourceName: [`${Models.ROLES_TABLE_NAME}`] })
    ]);

    const result: ServerRole.GetResponse = {
      id: role.id,
      systemName: role.systemName,
      accesses: fieldAccesses.filter(fa => fa.sourceId === role.id && fa.sourceName === `${Models.ROLES_TABLE_NAME}`)
    };

    return result;
  }

  async createRole(roleData: ServerRole.CreateRequest) {
    const role = await roleRepository.create({
      id: 0,
      systemName: roleData.systemName
    });

    await Promise.all((roleData.accesses || []).map(a => fieldAccessRepository.create({
      id: 0,
      sourceId: role.id,
      fieldId: a.fieldId,
      access: a.access,
      sourceName: Models.ROLES_TABLE_NAME
    })))

    return true;
  }

  async updateRole(id: number, roleData: ServerRole.CreateRequest) {
    const role = await roleRepository.updateById(id, {
      id: 0,
      systemName: roleData.systemName
    });

    const createdAccess = await fieldAccessRepository.find({
      fieldId: roleData.accesses.map(c => `${c.fieldId}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.ROLES_TABLE_NAME]
    })
    const notCreatedAccess = roleData.accesses.filter(a => createdAccess.find((ca => ca.fieldId === a.fieldId)));


    await Promise.all((createdAccess || []).map(a => fieldAccessRepository.update({
      access: `${a.access}`
    }, {
      fieldId: [a.fieldId].map(c => `${c}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.ROLES_TABLE_NAME]
    })))

    await Promise.all((notCreatedAccess || []).map(a => fieldAccessRepository.create({
      id: 0,
      sourceId: id,
      fieldId: a.fieldId,
      access: a.access,
      sourceName: Models.ROLES_TABLE_NAME
    })))

    return role
  }

  async deleteRole(id: number) {
    const accesses = await fieldAccessRepository.find({
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.ROLES_TABLE_NAME]
    })
    await Promise.all(accesses.map(a => fieldAccessRepository.deleteById(a.id)));
    const role = await roleRepository.deleteById(id);
    return role
  }
}

export = new RoleService();
