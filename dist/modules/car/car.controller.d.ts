import { CarService } from './car.service';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { CarRemoveDto } from './dto/car-remove.dto';
export declare class CarController {
    private readonly carService;
    constructor(carService: CarService);
    create(createCarDto: CreateCarDto): Promise<{
        id: number;
    }>;
    findAll(query: any): Promise<any>;
    findOne(id: string): Promise<any>;
    update(id: string, updateCarDto: UpdateCarDto): Promise<{
        id: number;
    }>;
    remove(id: string): Promise<{
        id: number;
        createdDate: string;
        ownerId: number;
    }>;
    removeMany(body: CarRemoveDto): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
