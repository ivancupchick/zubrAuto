import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class CarStatisticRepository extends BaseRepository<Models.CarStatistic> {
  constructor() {
    super(Models.Table.CarStatistic);
  }
}

export = new CarStatisticRepository();
