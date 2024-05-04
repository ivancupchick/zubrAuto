import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class ActivitiesRepository extends BaseRepository<Models.Table.Activities> {
  constructor() {
    super(Models.Table.Activities);
  }
}

export = new ActivitiesRepository();
