import { Router } from 'express'
import userController from '../controllers/auth.controller';
import { body } from 'express-validator';
import { authMiddleware } from '../middlewares/auth.middleware';


const router = Router();

router.route('/registration')
  .post(
    body('email').isEmail(),
    body('password').isLength({ min: 3, max: 32 }),
    userController.registration,
  )
router.route('/login').post(userController.login)
router.route('/logout').post(userController.logout)
router.route('/activate/:link').get(userController.activate)
router.route('/refresh').get(userController.refresh)
router.route('/users').get(authMiddleware, userController.getUsers) // replace to users.routers

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
