import { Router } from 'express'
import { body } from 'express-validator';
import { Constants } from '../utils/constansts';
import { authMiddleware } from '../middlewares/auth.middleware';
import changeLogController from '../controllers/change-log.controller';

const router = Router();

router.use(authMiddleware);

router.route('/')
    .get(changeLogController.getAll)
    .post(changeLogController.create);

router.route('/:id')
    .get(changeLogController.getOne)
    // .delete(changeLogController.deleteOne)
    .put(changeLogController.update);

export default router;
