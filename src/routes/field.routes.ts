import { Router } from 'express'
import { body } from 'express-validator';
import fieldConntroller from '../controllers/field.controller'
import { Constants } from '../utils/constansts';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.route(`/${ Constants.API.CRUD }/`)
    .get(fieldConntroller.getAllFields)
    .post(
      body('name').isLength({ min: 3, max: 50 }),
      body('name').matches(/^[a-z][a-z-]{1,50}[a-z]$/),
      body('flags').isNumeric(),
      body('domain').isNumeric(),
      body('variants').isString(),
      body('showUserLevel').isNumeric(),
      fieldConntroller.createField
    );

router.route(`/${ Constants.API.CRUD }/:fieldId`)
    .get(fieldConntroller.getField)
    .delete(fieldConntroller.deleteField)
    .put(fieldConntroller.updateField);

router.route('/getFieldsByDomain/:domain')
    .get(fieldConntroller.getFieldsByDomain)

export default router;
