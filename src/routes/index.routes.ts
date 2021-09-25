import { Router } from 'express'
import { indexWelcome } from '../controllers/index.controller'
import { Request, Response } from 'express'

const router = Router();

router.route('/')
    .get(indexWelcome);


export function modifyRequest(req: Request, res: Response, request: (req: Request, res: Response) => Promise<Response | void>): Promise<Response | void> {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Request-Method', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Max-Age', 2592000);

    return request(req, res);
}

export default router;
