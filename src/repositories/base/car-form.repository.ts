import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class CarFormRepository extends BaseRepository<Models.CarForm> {
  constructor() {
    super(Models.Table.CarForms);
  }
}

export = new CarFormRepository();
