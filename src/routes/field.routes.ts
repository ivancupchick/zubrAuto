import { Router } from 'express'
import fieldConntroller from '../controllers/field.controller'

const router = Router();

router.route('/crud/')
    .get(fieldConntroller.getAllFields)
    .post(fieldConntroller.createField);

router.route('/crud/:fieldId')
    .get(fieldConntroller.getField)
    .delete(fieldConntroller.deleteField)
    .put(fieldConntroller.updateField);

router.route('/getFieldsByDomain/:domain')
    .get(fieldConntroller.getFieldsByDomain)

export default router;
