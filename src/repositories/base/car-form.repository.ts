import { Models } from "../../entities/Models";
import { BaseRepository } from "./base.repository";

class carQuestionnaireRepository extends BaseRepository<Models.carQuestionnaire> {
  constructor() {
    super(Models.CAR_FORMS_TABLE_NAME);
  }
}

export = new carQuestionnaireRepository();
