import { Router } from 'express'
import { getClients, createClient, getClient, deleteClient, updateClient } from '../controllers/client.controller'
import { modifyRequest } from './index.routes';

const router = Router();

router.route('/')
    .get((req, res) => modifyRequest(req, res, getClients))
    .post((req, res) => modifyRequest(req, res, createClient));

router.route('/:clientId')
    // .get((req, res) => modifyRequest(req, res, getClient))
    .delete((req, res) => modifyRequest(req, res, deleteClient))
    .put((req, res) => modifyRequest(req, res, updateClient));

export default router;
