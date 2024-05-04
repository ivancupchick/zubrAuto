import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class CarOwnerRepository extends BaseRepository<Models.CarOwner> {
  constructor() {
    super(Models.Table.CarOwners);
  }
}

export = new CarOwnerRepository();
