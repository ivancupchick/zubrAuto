import { Router } from 'express'
import { Constants } from '../utils/constansts';
import phoneCallController from '../controllers/phone-call.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.route(`/${ Constants.API.WEB_HOOK }/`)
  .get(phoneCallController.webHookNotify)
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
