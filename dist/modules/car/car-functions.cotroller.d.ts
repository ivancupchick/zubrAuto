import { CarService } from './car.service';
import { CarStatisticService } from './services/car-statistic.service';
import { CarStatistic } from 'src/temp/entities/CarStatistic';
import { ServerCar } from 'src/temp/entities/Car';
import { CarImageService } from './services/car-image.service';
import { AddCustomerDiscountDto } from './dto/add-customer-discount.dto';
export declare class CarFunctionsController {
    private readonly carService;
    private readonly carStatisticService;
    private readonly carImageService;
    constructor(carService: CarService, carStatisticService: CarStatisticService, carImageService: CarImageService);
    addCustomerCall(params: any): Promise<{
        carId: number;
    }>;
    addCustomerDiscount(params: any, body: AddCustomerDiscountDto): Promise<{
        carId: number;
    }>;
    addCall(body: {
        carIds: number[];
    }): Promise<{
        carIds: number[];
    }>;
    getAllCarStatistic(params: any): Promise<(CarStatistic.BaseResponse | CarStatistic.CarShowingResponse)[]>;
    getCarShowingStatistic(params: any): Promise<CarStatistic.CarShowingResponse[]>;
    createCarShowing(params: any, body: {
        showingContent: CarStatistic.ShowingContent;
    }): Promise<{
        id: number;
        type: number;
        date: bigint;
        carId: number;
        content: string | null;
    }>;
    updateCarShowing(params: any, body: {
        showingId: number;
        showingContent: CarStatistic.ShowingContent;
    }): Promise<{
        id: number;
        type: number;
        date: bigint;
        carId: number;
        content: string | null;
    }>;
    createCarsByLink(body: ServerCar.CreateByLink): Promise<(ServerCar.Response | ServerCar.IdResponse)[]>;
    createCarsByManager(body: ServerCar.CreateByManager): Promise<(ServerCar.Response | ServerCar.IdResponse)[]>;
    getCarFiles(params: any): Promise<import("../../temp/entities/Models").Models.File[]>;
    deleteCarImage(params: any): Promise<import("../../temp/entities/File").ServerFile.IdResponse>;
    uploadCarImages(body: {
        carId: number;
        metadata: string;
    }, uploadedFile: Express.Multer.File, uploadedFiles: Array<Express.Multer.File>): Promise<any>;
    uploadCarStateImages(body: {
        carId: number;
        metadata: string;
    }, uploadedFile: Express.Multer.File, uploadedFiles: Array<Express.Multer.File>): Promise<any>;
    uploadCarImage360(body: {
        carId: number;
        metadata: string;
    }, uploadedFile: Express.Multer.File, uploadedFiles: Array<Express.Multer.File>): Promise<any>;
}
