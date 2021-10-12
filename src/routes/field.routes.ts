import { Router } from 'express'
import { getFields, createField, getField, deleteField, updateField, getFieldsByDomain } from '../controllers/field.controller'
import { modifyRequest } from './index.routes';


const router = Router();

router.route('/crud/')
    .get((req, res) => modifyRequest(req, res, getFields))
    .post((req, res) => modifyRequest(req, res, createField));

router.route('/crud/:fieldId')
    .get((req, res) => modifyRequest(req, res, getField))
    .delete((req, res) => modifyRequest(req, res, deleteField))
    .put((req, res) => modifyRequest(req, res, updateField));

router.route('/getFieldsByDomain/:domain')
    .get((req, res) => modifyRequest(req, res, getFieldsByDomain))

export default router;
