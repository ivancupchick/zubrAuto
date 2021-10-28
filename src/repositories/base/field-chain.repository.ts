import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class FieldChainRepository extends BaseRepository<Models.FieldChain> {
  constructor() {
    super(Models.FIELD_CHAINS_TABLE_NAME);
  }
}

export = new FieldChainRepository();
