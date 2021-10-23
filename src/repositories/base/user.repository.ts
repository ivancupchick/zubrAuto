import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class UserRepository extends BaseRepository<Models.User> {
  constructor() {
    super(Models.USERS_TABLE_NAME);
  }
}

export = new UserRepository();