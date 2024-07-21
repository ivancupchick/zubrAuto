import { Router } from 'express'
import { Constants } from '../utils/constansts';
import phoneCallController from '../controllers/phone-call.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.route(`/${ Constants.API.WEB_HOOK }/`)
  .get(phoneCallController.webHookNotify)
  .post(phoneCallController.webHookNotify)
  .put(phoneCallController.webHookNotify)
  .patch(phoneCallController.webHookNotify)

router.route('/')
  .get(authMiddleware, phoneCallController.getAll)

router.route('/:id')
    .get(authMiddleware, phoneCallController.getOne)
    // .delete(authMiddleware, phoneCallController.deleteOne)
    // .put(authMiddleware, phoneCallController.update);

export default router;
