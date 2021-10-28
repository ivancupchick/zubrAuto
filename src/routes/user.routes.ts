import { Router } from 'express'
import { body } from 'express-validator';
import userController from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';


const router = Router();

router.route('/crud/')
    .get(authMiddleware, userController.getAllUsers)
    .post(
      authMiddleware,
      body('email').isEmail(),
      body('password').isLength({ min: 3, max: 32 }),
      body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/),
      userController.createUser
    );

router.route('/crud/:fieldId')
    .get(authMiddleware, userController.getUser)
    .delete(authMiddleware, userController.deleteUser)
    .put(authMiddleware, userController.updateUser);

// router.route('/getUsersByDomain/:domain')
//     .get(getUsersByDomain)

export default router;
