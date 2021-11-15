import { Router } from 'express'
import { body } from 'express-validator';
import userController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { Constants } from '../utils/constansts';


const router = Router();

router.route(`/${ Constants.API.CRUD }/`)
    .get(authMiddleware, userController.getAll)
    .post(
      authMiddleware,
      body('email').isEmail(),
      body('password').isLength({ min: 3, max: 32 }),
      // body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/),
      userController.create
    );

router.route(`/${ Constants.API.CRUD }/:userId`)
    .get(authMiddleware, userController.get)
    .delete(authMiddleware, userController.delete)
    .put(authMiddleware, userController.update);

// router.route('/getUsersByDomain/:domain')
//     .get(getUsersByDomain)

export default router;
