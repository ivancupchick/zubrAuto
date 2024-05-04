import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class FieldChainRepository extends BaseRepository<Models.FieldChain> {
  constructor() {
    super(Models.Table.FieldChains);
  }
}

export = new FieldChainRepository();
