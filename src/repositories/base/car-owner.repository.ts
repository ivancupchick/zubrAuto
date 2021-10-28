import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class CarOwnerRepository extends BaseRepository<Models.CarOwner> {
  constructor() {
    super(Models.CAR_OWNERS_TABLE_NAME);
  }
}

export = new CarOwnerRepository();
