import { Router } from 'express'
import carController from '../controllers/car.controller';

const router = Router();

router.route('/')
    .get(carController.getAllCars)
    .post(carController.createCar);

router.route('/:carId')
    .get(carController.getCar)
    .delete(carController.deleteCar)
    .put(carController.updateCar);

export default router;
