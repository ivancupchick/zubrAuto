"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const express_validator_1 = require("express-validator");
const api_error_1 = require("../exceptions/api.error");
const car_image_service_1 = __importDefault(require("../services/car-image.service"));
const car_statistic_service_1 = __importDefault(require("../services/car-statistic.service"));
const car_service_1 = __importDefault(require("../services/car.service"));
class CarController {
    constructor() {
        this.getAllCars = (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const cars = yield car_service_1.default.getAll();
                return res.json(cars);
            }
            catch (e) {
                next(e);
            }
        });
    }
    createCar(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const newCar = req.body;
                const car = yield car_service_1.default.create(newCar);
                return res.json(car);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getCar(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const id = +req.params.carId;
                const car = yield car_service_1.default.get(id);
                return res.json(car);
            }
            catch (e) {
                next(e);
            }
        });
    }
    deleteCar(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const id = +req.params.carId;
                const car = yield car_service_1.default.delete(id);
                return res.json(car);
            }
            catch (e) {
                next(e);
            }
        });
    }
    updateCar(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const id = +req.params.carId;
                const updatedCar = req.body;
                const car = yield car_service_1.default.update(id, updatedCar);
                return res.json(car);
            }
            catch (e) {
                next(e);
            }
        });
    }
    createCarsByLink(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const body = req.body;
                const cars = yield car_service_1.default.createCarsByLink(body);
                return res.json(cars);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getImages(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const id = +req.params.carId;
                const result = yield car_image_service_1.default.getCarFiles(id);
                // const body: ServerCar.CreateByLink = req.body;
                // const cars = await carService.createCarsByLink(body);
                return res.json(result);
            }
            catch (e) {
                next(e);
            }
        });
    }
    deleteCarImage(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const carId = +req.params.carId;
                const imageId = +req.params.imageId;
                const result = yield car_image_service_1.default.deleteCarImage(carId, imageId);
                return res.json(true);
            }
            catch (e) {
                next(e);
            }
        });
    }
    uploadImages(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const file = req.files['file'];
                let files = Array.isArray(file)
                    ? file
                    : [file];
                const id = +req.body.carId;
                const metadata = req.body.metadata || '{}';
                const result = yield car_image_service_1.default.uploadCarImage(id, files, metadata);
                return res.json(result);
            }
            catch (e) {
                console.log(e);
                next(e);
            }
        });
    }
    uploadStateImages(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const file = req.files['file'];
                let files = Array.isArray(file)
                    ? file
                    : [file];
                const id = +req.body.carId;
                const metadata = req.body.metadata || '{}';
                const result = yield car_image_service_1.default.uploadCarStateImages(id, files, metadata);
                return res.json(result);
            }
            catch (e) {
                console.log(e);
                next(e);
            }
        });
    }
    uploadImage360(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const file = req.files['file'];
                let files = Array.isArray(file)
                    ? file
                    : [file];
                const id = +req.body.carId;
                const metadata = req.body.metadata || '{}';
                const result = yield car_image_service_1.default.uploadCarImage360(id, files[0], metadata);
                return res.json(result);
            }
            catch (e) {
                console.log(e);
                next(e);
            }
        });
    }
    // async uploadImages(req: Request, res: Response, next: NextFunction) {
    //   try {
    //     const errors = validationResult(req);
    //     if (!errors.isEmpty()) {
    //       throw ApiError.BadRequest('Ошибка при валидации', errors.array());
    //     }
    //     // const file = Array.isArray(((req as any).files as any).file)
    //     //   ? ((req as any).files as any).file[0]
    //     //   : ((req as any).files as any).file;
    //     const file = req.file;
    //     const metadata = req.body.metadata || '{}';
    //     const id = +req.body.carId;
    //     const result = await carImageService.uploadCarImage(id, file, metadata);
    //     return res.json(result);
    //   } catch (e) {
    //     next(e);
    //   }
    // }
    addCall(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const carIds = req.body.carIds;
                const result = yield car_statistic_service_1.default.addCall(carIds);
                return res.json(result);
            }
            catch (e) {
                next(e);
            }
        });
    }
    addCustomerCall(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const carId = +req.params.carId;
                const result = yield car_statistic_service_1.default.addCustomerCall(carId);
                return res.json(result);
            }
            catch (e) {
                next(e);
            }
        });
    }
    addCustomerDiscount(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const carId = +req.params.carId;
                const discount = +req.body.discount;
                const amount = +req.body.amount;
                const result = yield car_statistic_service_1.default.addCustomerDiscount(carId, discount, amount);
                return res.json(result);
            }
            catch (e) {
                next(e);
            }
        });
    }
    createCarShowing(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const carId = +req.params.carId;
                const carShowingContent = req.body.showingContent;
                const result = yield car_statistic_service_1.default.createCarShowing(carId, carShowingContent);
                return res.json(result);
            }
            catch (e) {
                next(e);
            }
        });
    }
    updateCarShowing(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const carId = +req.params.carId;
                const carShowingId = req.body.showingId;
                const carShowingContent = req.body.showingContent;
                const result = yield car_statistic_service_1.default.updateCarShowing(carShowingId, carId, carShowingContent);
                return res.json(result);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getCarStatistic(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const carId = +req.params.carId;
                const result = yield car_statistic_service_1.default.getCarShowingStatistic(carId);
                return res.json(result);
            }
            catch (e) {
                next(e);
            }
        });
    }
    getAllCarStatistic(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const errors = (0, express_validator_1.validationResult)(req);
                if (!errors.isEmpty()) {
                    throw api_error_1.ApiError.BadRequest('Ошибка при валидации', errors.array());
                }
                const carId = +req.params.carId;
                const result = yield car_statistic_service_1.default.getAllCarStatistic(carId);
                return res.json(result);
            }
            catch (e) {
                next(e);
            }
        });
    }
}
module.exports = new CarController();
//# sourceMappingURL=car.controller.js.map