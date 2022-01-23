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
const file_repository_1 = __importDefault(require("../repositories/base/file.repository"));
const Models_1 = require("../entities/Models");
const File_1 = require("../entities/File");
const s3_service_1 = __importDefault(require("./s3.service"));
const file_chain_repository_1 = __importDefault(require("../repositories/base/file-chain.repository"));
// implements ICrudService<ServerFile.CreateRequest, ServerFile.UpdateRequest, ServerFile.Response, ServerFile.IdResponse>
class CarImageService {
    uploadCarImage(carId, files, fileMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            // const extension = file.name.split('.').pop();
            const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (files.find(file => !imageTypes.includes(file.mimetype))) {
                throw new Error("Это не картинка");
            }
            const sendDataArray = yield Promise.all(files.map(file => s3_service_1.default.uploadFile(file)));
            const dbFiles = yield Promise.all(sendDataArray.map((sendData, i) => {
                let metadata = {};
                metadata.s3Information = sendData;
                const dbFile = {
                    url: sendData.Location,
                    type: File_1.ServerFile.Types.Image,
                    name: files[i].name,
                    parent: 0,
                    fileMetadata: JSON.stringify(metadata),
                };
                return file_repository_1.default.create(dbFile);
            }));
            yield Promise.all(dbFiles.map(dbFile => {
                return file_chain_repository_1.default.create({
                    sourceId: carId,
                    sourceName: Models_1.Models.CARS_TABLE_NAME,
                    fileId: dbFile.id
                });
            }));
            return dbFiles;
        });
    }
    uploadCarStateImages(carId, files, fileMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            // const extension = file.name.split('.').pop();
            const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (files.find(file => !imageTypes.includes(file.mimetype))) {
                throw new Error("Это не картинка");
            }
            const sendDataArray = yield Promise.all(files.map(file => s3_service_1.default.uploadFile(file)));
            const dbFiles = yield Promise.all(sendDataArray.map((sendData, i) => {
                let metadata = {};
                metadata.s3Information = sendData;
                const dbFile = {
                    url: sendData.Location,
                    type: File_1.ServerFile.Types.StateImage,
                    name: files[i].name,
                    parent: 0,
                    fileMetadata: JSON.stringify(metadata),
                };
                return file_repository_1.default.create(dbFile);
            }));
            yield Promise.all(dbFiles.map(dbFile => {
                return file_chain_repository_1.default.create({
                    sourceId: carId,
                    sourceName: Models_1.Models.CARS_TABLE_NAME,
                    fileId: dbFile.id
                });
            }));
            return dbFiles;
        });
    }
    uploadCarImage360(carId, file, fileMetadata) {
        return __awaiter(this, void 0, void 0, function* () {
            // const extension = file.name.split('.').pop();
            const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!imageTypes.includes(file.mimetype)) {
                throw new Error("Это не картинка");
            }
            const allImageFileChains = yield file_chain_repository_1.default.find({ sourceName: [`${Models_1.Models.CARS_TABLE_NAME}`], sourceId: [`${carId}`] });
            const allImageFiles = yield file_repository_1.default.getAll();
            const existImage360 = allImageFiles.find(file => file.type === File_1.ServerFile.Types.Image360 && allImageFileChains.find(ch => ch.sourceId === carId));
            if (existImage360) {
                yield this.deleteCarImage(carId, existImage360.id);
            }
            const sendData = yield s3_service_1.default.uploadFile(file);
            let metadata = {};
            metadata.s3Information = sendData;
            const dbFile = {
                url: sendData.Location,
                type: File_1.ServerFile.Types.Image360,
                name: file.name,
                parent: 0,
                fileMetadata: JSON.stringify(metadata),
            };
            const dbFileRes = yield file_repository_1.default.create(dbFile);
            yield file_chain_repository_1.default.create({
                sourceId: carId,
                sourceName: Models_1.Models.CARS_TABLE_NAME,
                fileId: dbFileRes.id
            });
            return dbFileRes;
        });
    }
    getFiles(sourceId = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const fileChainesExpression = {
                sourceName: [`${Models_1.Models.CARS_TABLE_NAME}`]
            };
            if (sourceId) {
                fileChainesExpression.sourceId = [`${sourceId}`];
            }
            const [files, fileChaines] = yield Promise.all([
                file_repository_1.default.getAll(),
                file_chain_repository_1.default.find(fileChainesExpression),
            ]);
            const fileIds = fileChaines.map(fileChain => fileChain.fileId);
            const result = files
                .filter(file => fileIds.includes(file.id));
            return result.map(r => {
                return r;
            });
        });
    }
    getCarFiles(carId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield this.getFiles(carId);
            }
            catch (error) {
                console.log(error);
                return [];
            }
        });
    }
    deleteCarImage(carId, imageId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield file_chain_repository_1.default.deleteOne({ fileId: [`${imageId}`], sourceName: [`${Models_1.Models.CARS_TABLE_NAME}`], sourceId: [`${carId}`] });
            const result = yield file_repository_1.default.deleteById(imageId);
            return result;
        });
    }
}
module.exports = new CarImageService();
//# sourceMappingURL=car-image.service.js.map