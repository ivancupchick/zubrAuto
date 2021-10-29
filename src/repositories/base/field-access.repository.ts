import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class FieldAccessRepository extends BaseRepository<Models.FieldAccess> {
  constructor() {
    super(Models.FIELD_ACCESSES_TABLE_NAME);
  }
}

export = new FieldAccessRepository();
