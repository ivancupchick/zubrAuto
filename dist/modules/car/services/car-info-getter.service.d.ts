import { ServerCar } from 'src/temp/entities/Car';
import { ServerField } from 'src/temp/entities/Field';
import { PropertyName } from '../entities/car-info-getter';
import { FieldNames } from 'src/temp/entities/FieldNames';
export declare class CarInfoGetterService {
    getCarsInfo(queries: string, carFieldConfigs: ServerField.Response[], carOwnerFieldConfigs: ServerField.Response[], userId: number): Promise<ServerCar.CreateRequest[]>;
    getCarsInfoByManualInfo(carsManualInfo: string[], carFieldConfigs: ServerField.Response[], carOwnerFieldConfigs: ServerField.Response[], userId: number): Promise<ServerCar.CreateRequest[]>;
    private getResponseFromLink;
    private get;
    private converCarsInfoToServerCars;
    private getCarFieldValue;
    getPropertyName(name: FieldNames.Car | FieldNames.CarOwner): PropertyName | string;
    private convertEngineType;
    private convertEngineCapacity;
    private convertTransmission;
    private convertDriveType;
}
