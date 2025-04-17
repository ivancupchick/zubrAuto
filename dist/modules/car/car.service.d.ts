import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { StringHash } from 'src/temp/models/hashes';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldsService } from 'src/core/fields/fields.service';
import { FieldChainService } from 'src/core/fields/services/field-chain.service';
import { UserService } from '../user/user.service';
import { ServerCar } from 'src/temp/entities/Car';
import { CarInfoGetterService } from './services/car-info-getter.service';
export declare class CarService {
    private prisma;
    private userService;
    private fieldsService;
    private fieldChainService;
    private carInfoGetterService;
    constructor(prisma: PrismaService, userService: UserService, fieldsService: FieldsService, fieldChainService: FieldChainService, carInfoGetterService: CarInfoGetterService);
    private getCars;
    findOne(id: number): Promise<any>;
    findAll(): Promise<any>;
    findMany(query: StringHash): Promise<any>;
    private getCarAndOwnerCarFields;
    createCarInDB(createCarDto: CreateCarDto): Promise<{
        id: number;
    }>;
    create(createCarDto: CreateCarDto): Promise<{
        id: number;
    }>;
    update(carId: number, updateCarDto: UpdateCarDto): Promise<{
        id: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdDate: string;
        ownerId: number;
    }>;
    removeMany(ids: string[]): Promise<import(".prisma/client").Prisma.BatchPayload>;
    createCarsByLink(data: ServerCar.CreateByLink): Promise<(ServerCar.Response | ServerCar.IdResponse)[]>;
    createCarsByManager(data: ServerCar.CreateByManager): Promise<(ServerCar.Response | ServerCar.IdResponse)[]>;
}
