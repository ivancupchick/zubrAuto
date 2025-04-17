import { S3Service } from 'src/core/files/services/s3.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServerFile } from 'src/temp/entities/File';
export declare class CarImageService {
    private s3Service;
    private prisma;
    constructor(s3Service: S3Service, prisma: PrismaService);
    uploadCarImages(carId: number, files: Express.Multer.File[], fileMetadata: string): Promise<any>;
    uploadCarStateImages(carId: number, files: Express.Multer.File[], fileMetadata: string): Promise<any>;
    uploadCarImage360(carId: number, file: Express.Multer.File, fileMetadata: string): Promise<any>;
    private getFiles;
    getCarFiles(carId: number): Promise<ServerFile.Response[]>;
    deleteCarImage(carId: number, imageId: number): Promise<ServerFile.IdResponse>;
}
