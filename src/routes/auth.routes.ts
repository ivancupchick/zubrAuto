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
router.route('/users').get(authMiddleware, authController.getUsers) // replace to users.routers

// router.route('/crud/')
//     .get((req, res) => modifyRequest(req, res, getFields))
//     .post((req, res) => modifyRequest(req, res, createField));

// router.route('/crud/:fieldId')
//     .get((req, res) => modifyRequest(req, res, getField))
//     .delete((req, res) => modifyRequest(req, res, deleteField))
//     .put((req, res) => modifyRequest(req, res, updateField));

// router.route('/getFieldsByDomain/:domain')
//     .get((req, res) => modifyRequest(req, res, getFieldsByDomain))

export default router;
