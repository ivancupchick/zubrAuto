import { Router } from 'express'
import { Constants } from '../utils/constansts';
import phoneCallController from '../controllers/phone-call.controller';

const router = Router();

router.route(`/${ Constants.API.WEB_HOOK }/`)
  .post(phoneCallController.webHookNotify)
  .put(phoneCallController.webHookNotify)
  .patch(phoneCallController.webHookNotify)

router.route('/')
  .get(phoneCallController.getAll)

router.route('/:clientId')
    .get(phoneCallController.getOne)
    // .delete(phoneCallController.deleteOne)
    // .put(phoneCallController.update);

export default router;