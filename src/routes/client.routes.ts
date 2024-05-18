import { Router } from 'express'
import { body } from 'express-validator';
import clientController from '../controllers/client.controller'
import { Constants } from '../utils/constansts';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.route('/')
    .get(clientController.getAll)
    .post(clientController.create);

router.route('/:clientId')
    .get(clientController.getOne)
    .delete(clientController.deleteOne)
    .put(clientController.update);

router.route(`/${Constants.API.COMPLETE_DEAL}`)
  .post(
    body('clientId').isNumeric().notEmpty(),
    body('carId').isNumeric().notEmpty(),
    clientController.completeDeal
  );

export default router;
