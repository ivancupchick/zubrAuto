import { Router } from 'express'
import authController from '../controllers/auth.controller';
import { body } from 'express-validator';
import { authMiddleware } from '../middlewares/auth.middleware';


const router = Router();

router.route('/registration')
  .post(
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    authController.registration,
  )
router.route('/login').post(authController.login)
router.route('/logout').post(authController.logout)
router.route('/activate/:link').get(authController.activate)
router.route('/refresh').get(authController.refresh)

export default router;
