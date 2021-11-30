import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class CarFormRepository extends BaseRepository<Models.CarForm> {
  constructor() {
    super(Models.CAR_FORMS_TABLE_NAME);
  }
}

export = new CarFormRepository();
