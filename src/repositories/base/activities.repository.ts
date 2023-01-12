import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class ActivitiesRepository extends BaseRepository<Models.Activities> {
  constructor() {
    super(Models.ACTIVITIES);
  }
}

export = new ActivitiesRepository();
