"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CarImageService = void 0;
const common_1 = require("@nestjs/common");
const s3_service_1 = require("../../../core/files/services/s3.service");
const prisma_service_1 = require("../../../prisma/prisma.service");
const File_1 = require("../../../temp/entities/File");
const Models_1 = require("../../../temp/entities/Models");
let CarImageService = class CarImageService {
    constructor(s3Service, prisma) {
        this.s3Service = s3Service;
        this.prisma = prisma;
    }
    async uploadCarImages(carId, files, fileMetadata) {
        const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (files.find(file => !imageTypes.includes(file.mimetype))) {
            throw new Error("Это не картинка");
        }
        const sendDataArray = await Promise.all(files.map(file => this.s3Service.uploadFile(file)));
        const dbFiles = await Promise.all(sendDataArray.map((sendData, i) => {
            let metadata = {};
            metadata.s3Information = sendData;
            const dbFile = {
                url: sendData.Location,
                type: File_1.ServerFile.Types.Image,
                name: files[i].filename,
                parent: 0,
                fileMetadata: JSON.stringify(metadata),
            };
            return this.prisma.files.create({ data: dbFile });
        }));
        await Promise.all(dbFiles.map(dbFile => {
            return this.prisma.filesIds.create({ data: {
                    sourceId: carId,
                    sourceName: Models_1.Models.Table.Cars,
                    fileId: dbFile.id
                } });
        }));
        return dbFiles;
    }
    async uploadCarStateImages(carId, files, fileMetadata) {
        const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (files.find(file => !imageTypes.includes(file.mimetype))) {
            throw new Error("Это не картинка");
        }
        const sendDataArray = await Promise.all(files.map(file => this.s3Service.uploadFile(file)));
        const dbFiles = await Promise.all(sendDataArray.map((sendData, i) => {
            let metadata = {};
            metadata.s3Information = sendData;
            const dbFile = {
                url: sendData.Location,
                type: File_1.ServerFile.Types.StateImage,
                name: files[i].filename,
                parent: 0,
                fileMetadata: JSON.stringify(metadata),
            };
            return this.prisma.files.create({ data: dbFile });
        }));
        await Promise.all(dbFiles.map(dbFile => {
            return this.prisma.filesIds.create({ data: {
                    sourceId: carId,
                    sourceName: Models_1.Models.Table.Cars,
                    fileId: dbFile.id
                } });
        }));
        return dbFiles;
    }
    async uploadCarImage360(carId, file, fileMetadata) {
        const imageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!imageTypes.includes(file.mimetype)) {
            throw new Error("Это не картинка");
        }
        const allImageFileChains = await this.prisma.filesIds.findMany({ where: { sourceName: Models_1.Models.Table.Cars, sourceId: carId } });
        const allImageFiles = await this.prisma.files.findMany();
        const existImage360 = allImageFiles.find(file => file.type === File_1.ServerFile.Types.Image360 && allImageFileChains.find(ch => ch.sourceId === carId));
        if (existImage360) {
            await this.deleteCarImage(carId, existImage360.id);
        }
        const sendData = await this.s3Service.uploadFile(file);
        let metadata = {};
        metadata.s3Information = sendData;
        const dbFile = {
            url: sendData.Location,
            type: File_1.ServerFile.Types.Image360,
            name: file.filename,
            parent: 0,
            fileMetadata: JSON.stringify(metadata),
        };
        const dbFileRes = await this.prisma.files.create({ data: dbFile });
        await this.prisma.filesIds.create({ data: {
                sourceId: carId,
                sourceName: Models_1.Models.Table.Cars,
                fileId: dbFileRes.id
            } });
        return dbFileRes;
    }
    async getFiles(sourceId = null) {
        const fileChainesExpression = {
            sourceName: Models_1.Models.Table.Cars
        };
        if (sourceId) {
            fileChainesExpression.sourceId = sourceId;
        }
        const [files, fileChaines] = await Promise.all([
            this.prisma.files.findMany(),
            this.prisma.filesIds.findMany({ where: fileChainesExpression }),
        ]);
        const fileIds = fileChaines.map(fileChain => fileChain.fileId);
        const result = files
            .filter(file => fileIds.includes(file.id));
        return result.map(r => {
            return r;
        });
    }
    async getCarFiles(carId) {
        try {
            return await this.getFiles(carId);
        }
        catch (error) {
            console.log(error);
            return [];
        }
    }
    async deleteCarImage(carId, imageId) {
        const result = await this.prisma.filesIds.deleteMany({ where: { fileId: imageId, sourceName: Models_1.Models.Table.Cars, sourceId: carId } });
        return result[0];
    }
};
exports.CarImageService = CarImageService;
exports.CarImageService = CarImageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [s3_service_1.S3Service, prisma_service_1.PrismaService])
], CarImageService);
//# sourceMappingURL=car-image.service.js.map