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
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCar = exports.deleteCar = exports.getCar = exports.createCar = exports.getCars = void 0;
// DB
const database_1 = require("../database");
function getCars(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Request-Method', '*');
        res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
        res.setHeader('Access-Control-Allow-Headers', '*');
        res.setHeader('Access-Control-Max-Age', 2592000);
        try {
            // const conn = await connect();
            // const cars = await conn.query('SELECT * FROM cars');
            return res.json('success');
        }
        catch (e) {
            console.log(e);
        }
    });
}
exports.getCars = getCars;
function createCar(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const newCar = req.body;
        const conn = yield (0, database_1.connect)();
        yield conn.query('INSERT INTO cars SET ?', [newCar]);
        res.json({
            message: 'New Car Created'
        });
    });
}
exports.createCar = createCar;
function getCar(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.params.carId;
        const conn = yield (0, database_1.connect)();
        const cars = yield conn.query('SELECT * FROM cars WHERE id = ?', [id]);
        res.json(cars[0]);
    });
}
exports.getCar = getCar;
function deleteCar(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.params.carId;
        const conn = yield (0, database_1.connect)();
        yield conn.query('DELETE FROM cars WHERE id = ?', [id]);
        res.json({
            message: 'Car deleted'
        });
    });
}
exports.deleteCar = deleteCar;
function updateCar(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = req.params.carId;
        const updateCar = req.body;
        const conn = yield (0, database_1.connect)();
        yield conn.query('UPDATE cars set ? WHERE id = ?', [updateCar, id]);
        res.json({
            message: 'Car Updated'
        });
    });
}
exports.updateCar = updateCar;
