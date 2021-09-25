import { Router } from 'express'
import { getCars, createCar, getCar, deleteCar, updateCar } from '../controllers/car.controller'
import { modifyRequest } from './index.routes';

const router = Router();

router.route('/')
    .get((req, res) => modifyRequest(req, res, getCars))
    .post((req, res) => modifyRequest(req, res, createCar));

router.route('/:carId')
    // .get((req, res) => modifyRequest(req, res, getCar))
    .delete((req, res) => modifyRequest(req, res, deleteCar))
    .put((req, res) => modifyRequest(req, res, updateCar));

export default router;
