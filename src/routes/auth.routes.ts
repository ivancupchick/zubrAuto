import { Router } from 'express'
import authController from '../controllers/auth.controller';
import { body } from 'express-validator';

const router = Router();

router.route('/registration')
  .post(
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    body('password').matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*$/),
    authController.registration,
  )
router.route('/login').post(authController.login)
router.route('/logout').post(authController.logout)
router.route('/activate/:link').get(authController.activate)
router.route('/refresh').get(authController.refresh)

export default router;
