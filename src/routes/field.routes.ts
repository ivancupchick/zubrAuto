import { Router } from 'express'
import { getFields, createField, getField, deleteField, updateField, getFieldsByDomain } from '../controllers/field.controller'

const router = Router();

router.route('/crud/')
    .get(getFields)
    .post(createField);

router.route('/crud/:fieldId')
    .get(getField)
    .delete(deleteField)
    .put(updateField);

router.route('/getFieldsByDomain/:domain')
    .get(getFieldsByDomain)

export default router;
