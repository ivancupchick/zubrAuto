import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class ClientRepository extends BaseRepository<Models.Client> {
  constructor() {
    super(Models.CLIENTS_TABLE_NAME);
  }
}

export = new ClientRepository();
