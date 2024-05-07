import { Router } from 'express'
import { Constants } from '../utils/constansts';
import callRequestController from '../controllers/call-request.controller';

const router = Router();

router.route(`/${ Constants.API.CALL_REQUEST }/`)
  .post(callRequestController.callRequest)

router.route('/')
  .get(callRequestController.getAll)

router.route('/:id')
    .get(callRequestController.getOne)
    .delete(callRequestController.deleteOne)
    .put(callRequestController.update);

export default router;
