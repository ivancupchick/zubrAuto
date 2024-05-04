import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class ClientRepository extends BaseRepository<Models.Client> {
  constructor() {
    super(Models.Table.Clients);
  }
}

export = new ClientRepository();
