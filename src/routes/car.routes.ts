import { Router } from 'express'
import { body } from 'express-validator';
import carController from '../controllers/car.controller';
import { Constants } from '../utils/constansts';
import carFunctionsController from '../controllers/car-functions.controller';

const router = Router();

router.route(`/${ Constants.API.CRUD }/`)
  .get(carController.getAll)
  .post(carController.create);
router.route(`/${ Constants.API.CRUD }/:carId`)
  .get(carController.getOne)
  .delete(carController.deleteOne)
  .put(carController.update);

router.route(`/${ Constants.API.DELETE_CARS }`)
  .post(
    body('carIds').isArray(),
    carController.delete
  );

router.route(`/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CUSTOMER_CALL }/:carId`)
  .post(
    carFunctionsController.addCustomerCall
  );

router.route(`/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CUSTOMER_DISCOUNT }/:carId`)
  .post(
    body('amount').isNumeric(),
    body('discount').isNumeric(),
    carFunctionsController.addCustomerDiscount
  );

router.route(`/${ Constants.API.STATISTIC }/${ Constants.API.ADD_CALL }`)
  .post(carFunctionsController.addCall);

router.route(`/${ Constants.API.STATISTIC }/:carId`)
  .get(carFunctionsController.getAllCarStatistic)

router.route(`/${ Constants.API.STATISTIC }/${ Constants.API.CAR_SHOWING }/:carId`)
  .get(carFunctionsController.getCarStatistic)
  .post(carFunctionsController.createCarShowing)
  .put(
    body('showingId').notEmpty().isNumeric(),
    body('showingContent').notEmpty().isObject(),
    carFunctionsController.updateCarShowing
  );

router.route(`/${Constants.API.CREATE_CARS_BY_LINK}`)
  .post(carFunctionsController.createCarsByLink);

router.route(`/${Constants.API.IMAGES}/:carId`)
  .get(carFunctionsController.getImages);

router.route(`/${Constants.API.IMAGES}/:carId/:imageId`)
  .delete(carFunctionsController.deleteCarImage);

router.route(`/${Constants.API.IMAGES}`)
  .post(
    carFunctionsController.uploadImages
  );
router.route(`/${Constants.API.STATE_IMAGES}`)
  .post(
    carFunctionsController.uploadStateImages
  );
router.route(`/${Constants.API.IMAGE360}`)
  .post(
    carFunctionsController.uploadImage360
  );


export default router;
