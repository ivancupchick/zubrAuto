import { Router } from 'express'
import roleController from '../controllers/role.controller'

const router = Router();

router.route('/')
    .get(roleController.getAllRoles)
    .post(roleController.createRole);

router.route('/:roleId')
    .get(roleController.getRole)
    .delete(roleController.deleteRole)
    .put(roleController.updateRole);

export default router;
