import { FieldChainService } from 'src/core/fields/services/field-chain.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CarStatistic } from 'src/temp/entities/CarStatistic';
export declare class CarStatisticService {
    private prisma;
    private fieldChainService;
    constructor(prisma: PrismaService, fieldChainService: FieldChainService);
    addCall(carIds: number[]): Promise<{
        carIds: number[];
    }>;
    createCarShowing(carId: number, carShowingContent: CarStatistic.ShowingContent): Promise<{
        id: number;
        type: number;
        date: bigint;
        carId: number;
        content: string | null;
    }>;
    updateCarShowing(carShowingId: number, carId: number, carShowingContent: CarStatistic.ShowingContent): Promise<{
        id: number;
        type: number;
        date: bigint;
        carId: number;
        content: string | null;
    }>;
    getCarShowingStatistic(carId: number): Promise<CarStatistic.CarShowingResponse[]>;
    getAllCarStatistic(carId: number): Promise<(CarStatistic.CarShowingResponse | CarStatistic.BaseResponse)[]>;
    addCustomerCall(carId: number): Promise<{
        carId: number;
    }>;
    addCustomerDiscount(carId: number, discount: number, amount: number): Promise<{
        carId: number;
    }>;
}
