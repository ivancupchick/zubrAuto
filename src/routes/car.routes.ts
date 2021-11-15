import { Router } from 'express'
import carController from '../controllers/car.controller';
import { Constants } from '../utils/constansts';

const router = Router();

router.route(`/${ Constants.API.CRUD }/`)
    .get(carController.getAllCars)
    .post(carController.createCar);

router.route(`/${ Constants.API.CRUD }/:carId`)
    .get(carController.getCar)
    .delete(carController.deleteCar)
    .put(carController.updateCar);

router.route(`/${Constants.API.CREATE_CARS_BY_LINK}`)
  .post(carController.createCarsByLink)

export default router;
