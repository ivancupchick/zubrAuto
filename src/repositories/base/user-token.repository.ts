import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class UserTokenRepository extends BaseRepository<Models.UserToken> {
  constructor() {
    super(Models.USER_TOKENS_TABLE_NAME);
  }
}

export = new UserTokenRepository();