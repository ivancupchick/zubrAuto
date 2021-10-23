import { Router } from 'express'
import { getCars, createCar, getCar, deleteCar, updateCar } from '../controllers/car.controller'

const router = Router();

router.route('/')
    .get(getCars)
    .post(createCar);

router.route('/:carId')
    // .get(getCar)
    .delete(deleteCar)
    .put(updateCar);

export default router;
