import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class CarRepository extends BaseRepository<Models.Car> {
  constructor() {
    super(Models.CARS_TABLE_NAME);
  }
}

export = new CarRepository();
