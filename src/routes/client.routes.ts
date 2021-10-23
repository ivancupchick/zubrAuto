import { Router } from 'express'
import { getClients, createClient, getClient, deleteClient, updateClient } from '../controllers/client.controller'

const router = Router();

router.route('/')
    .get(getClients)
    .post(createClient);

router.route('/:clientId')
    // .get(getClient)
    .delete(deleteClient)
    .put(updateClient);

export default router;
