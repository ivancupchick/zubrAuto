import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class CarStatisticRepository extends BaseRepository<Models.CarStatistic> {
  constructor() {
    super(Models.CAR_STATISTIC_TABLE_NAME);
  }
}

export = new CarStatisticRepository();
