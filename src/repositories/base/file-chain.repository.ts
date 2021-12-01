import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class FileChainRepository extends BaseRepository<Models.FileChain> {
  constructor() {
    super(Models.FILE_CHAINS_TABLE_NAME);
  }
}

export = new FileChainRepository();
