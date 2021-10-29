import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class RoleRepository extends BaseRepository<Models.Role> {
  constructor() {
    super(Models.ROLES_TABLE_NAME);
  }
}

export = new RoleRepository();
