import { Router } from 'express'
import { getFields, createField, getField, deleteField, updateField } from '../controllers/field.controller'
import { modifyRequest } from './index.routes';


const router = Router();

router.route('/')
    .get((req, res) => modifyRequest(req, res, getFields))
    .post((req, res) => modifyRequest(req, res, createField));

router.route('/:fieldId')
    // .get((req, res) => modifyRequest(req, res, getField))
    .delete((req, res) => modifyRequest(req, res, deleteField))
    .put((req, res) => modifyRequest(req, res, updateField));



export default router;
