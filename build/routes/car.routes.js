"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const car_controller_1 = require("../controllers/car.controller");
const router = (0, express_1.Router)();
router.route('/')
    .get(car_controller_1.getCars)
    .post(car_controller_1.createCar);
router.route('/:carId')
    .get(car_controller_1.getCar)
    .delete(car_controller_1.deleteCar)
    .put(car_controller_1.updateCar);
exports.default = router;
