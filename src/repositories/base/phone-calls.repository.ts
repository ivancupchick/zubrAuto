import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class FieldRepository extends BaseRepository<Models.PhoneCall> {
  constructor() {
    super(Models.Table.PhoneCalls);
  }
}

export = new FieldRepository();
