import { Router } from 'express'
import { body } from 'express-validator';
import userController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { Constants } from '../utils/constansts';


const router = Router();

router.use(authMiddleware);

router.route(`/${ Constants.API.CRUD }/`)
    .get(userController.getAll)
    .post(
      body('email').isEmail(),
      body('password').isLength({ min: 3, max: 32 }),
      // body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/),
      userController.create
    );

router.route(`/${ Constants.API.CRUD }/:id`)
    .get(userController.getOne)
    .delete(userController.deleteOne)
    .put(userController.update);

// router.route('/getUsersByDomain/:domain')
//     .get(getUsersByDomain)

export default router;
