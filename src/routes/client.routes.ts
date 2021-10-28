import { Router } from 'express'
import clientController from '../controllers/client.controller'

const router = Router();

router.route('/')
    .get(clientController.getAllClient)
    .post(clientController.createClient);

router.route('/:clientId')
    .get(clientController.getClient)
    .delete(clientController.deleteClient)
    .put(clientController.updateClient);

export default router;
