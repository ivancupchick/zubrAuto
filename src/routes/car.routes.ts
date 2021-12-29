import { Router } from 'express'
import { body } from 'express-validator';
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
  
router.route(`/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CUSTOMER_CALL }/:carId`)
  .post(
    carController.addCustomerCall
  ); 

router.route(`/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CUSTOMER_DISCOUNT }/:carId`)
  .post(
    body('amount').isNumeric(),
    body('discount').isNumeric(),
    carController.addCustomerDiscount
  ); 

router.route(`/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CALL }`)
  .post(carController.addCall);

router.route(`/${ Constants.API.STATISTIC }/:carId`)
  .get(carController.getAllCarStatistic)

router.route(`/${ Constants.API.STATISTIC }/${ Constants.API.CAR_SHOWING }/:carId`)
  .get(carController.getCarStatistic)
  .post(carController.createCarShowing)
  .put(
    body('showingId').notEmpty().isNumeric(),
    body('showingContent').notEmpty().isObject(),
    carController.updateCarShowing
  );

router.route(`/${Constants.API.CREATE_CARS_BY_LINK}`)
  .post(carController.createCarsByLink);

router.route(`/${Constants.API.IMAGES}/:carId`)
  .get(carController.getImages);

router.route(`/${Constants.API.IMAGES}/:carId`)
  .put(carController.uploadImages);

export default router;
