import { Router } from 'express'
import { indexWelcome } from '../controllers/index.controller'
import { Request, Response } from 'express'

const router = Router();

router.route('/')
    .get(indexWelcome);

export default router;
