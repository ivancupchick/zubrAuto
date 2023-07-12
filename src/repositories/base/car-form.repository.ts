import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class CarQuestionnaireRepository extends BaseRepository<Models.CarQuestionnaire> {
  constructor() {
    super(Models.CAR_FORMS_TABLE_NAME);
  }
}

export = new CarQuestionnaireRepository();
