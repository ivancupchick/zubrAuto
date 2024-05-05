import { Router } from 'express'
import { Constants } from '../utils/constansts';
import callRequestController from '../controllers/call-request.controller';

const router = Router();

router.route(`/${ Constants.API.CALL_REQUEST }/`)
  .post(callRequestController.callRequest)

router.route('/')
  .get(callRequestController.getAll)

router.route('/:clientId')
    .get(callRequestController.getOne)
    // .delete(phoneCallController.deleteOne)
    // .put(phoneCallController.update);

export default router;
