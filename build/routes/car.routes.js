"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const car_controller_1 = __importDefault(require("../controllers/car.controller"));
const constansts_1 = require("../utils/constansts");
const router = (0, express_1.Router)();
router.route(`/${constansts_1.Constants.API.CRUD}/`)
    .get(car_controller_1.default.getAllCars)
    .post(car_controller_1.default.createCar);
router.route(`/${constansts_1.Constants.API.CRUD}/:carId`)
    .get(car_controller_1.default.getCar)
    .delete(car_controller_1.default.deleteCar)
    .put(car_controller_1.default.updateCar);
router.route(`/${constansts_1.Constants.API.STATISTIC}/${constansts_1.Constants.API.ADD_CUSTOMER_CALL}/:carId`)
    .post(car_controller_1.default.addCustomerCall);
router.route(`/${constansts_1.Constants.API.STATISTIC}/${constansts_1.Constants.API.ADD_CUSTOMER_DISCOUNT}/:carId`)
    .post((0, express_validator_1.body)('amount').isNumeric(), (0, express_validator_1.body)('discount').isNumeric(), car_controller_1.default.addCustomerDiscount);
router.route(`/${constansts_1.Constants.API.STATISTIC}/${constansts_1.Constants.API.ADD_CALL}`)
    .post(car_controller_1.default.addCall);
router.route(`/${constansts_1.Constants.API.STATISTIC}/:carId`)
    .get(car_controller_1.default.getAllCarStatistic);
router.route(`/${constansts_1.Constants.API.STATISTIC}/${constansts_1.Constants.API.CAR_SHOWING}/:carId`)
    .get(car_controller_1.default.getCarStatistic)
    .post(car_controller_1.default.createCarShowing)
    .put((0, express_validator_1.body)('showingId').notEmpty().isNumeric(), (0, express_validator_1.body)('showingContent').notEmpty().isObject(), car_controller_1.default.updateCarShowing);
router.route(`/${constansts_1.Constants.API.CREATE_CARS_BY_LINK}`)
    .post(car_controller_1.default.createCarsByLink);
router.route(`/${constansts_1.Constants.API.IMAGES}/:carId`)
    .get(car_controller_1.default.getImages);
router.route(`/${constansts_1.Constants.API.IMAGES}/:carId/:imageId`)
    .delete(car_controller_1.default.deleteCarImage);
router.route(`/${constansts_1.Constants.API.IMAGES}`)
    .post(car_controller_1.default.uploadImages);
router.route(`/${constansts_1.Constants.API.STATE_IMAGES}`)
    .post(car_controller_1.default.uploadStateImages);
router.route(`/${constansts_1.Constants.API.IMAGE360}`)
    .post(car_controller_1.default.uploadImage360);
exports.default = router;
//# sourceMappingURL=car.routes.js.map