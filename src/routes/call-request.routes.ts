import { Router } from 'express'
import { Constants } from '../utils/constansts';
import callRequestController from '../controllers/call-request.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.route(`/${ Constants.API.CALL_REQUEST }/`)
  .post(callRequestController.callRequest)

router.route('/')
  .get(authMiddleware, callRequestController.getAll)

router.route('/:id')
    .get(authMiddleware, callRequestController.getOne)
    .delete(authMiddleware, callRequestController.deleteOne)
    .put(authMiddleware, callRequestController.update);

export default router;
