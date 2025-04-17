import { Injectable } from '@nestjs/common';
import { ApiError } from 'src/core/exceptions/api.error';
import { FieldDomains } from 'src/core/fields/fields';
import { FieldChainService } from 'src/core/fields/services/field-chain.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CarStatistic } from 'src/temp/entities/CarStatistic';
import { FieldNames } from 'src/temp/entities/FieldNames';
import { Models } from 'src/temp/entities/Models';

@Injectable()
export class CarStatisticService {
  constructor(private prisma: PrismaService, private fieldChainService: FieldChainService) {}

  async addCall(carIds: number[]) {
    const ids = carIds.filter(id => !Number.isNaN(id));
    if (ids.length === 0) {
      return { carIds };
    }

    await Promise.all([
      ...ids.map(id => {
        const timestamp = +(new Date());
        return this.prisma.carStatistic.create({data:{
          carId: id,
          type: CarStatistic.Type.call,
          date: timestamp,
          content: ''
        }})
      })
    ])

    return { carIds };
  }

  async createCarShowing(carId: number, carShowingContent: CarStatistic.ShowingContent) {
    if (!carShowingContent.date || !carShowingContent.status || !carShowingContent.clientId) {
      throw new Error("Ошибка в параметрах создаваемого показа");
    }

    const timestamp = +(new Date());
    const result = await this.prisma.carStatistic.create({data:{
      carId,
      type: CarStatistic.Type.showing,
      date: timestamp,
      content: JSON.stringify(carShowingContent)
    }})

    return result;
  }

  async updateCarShowing(carShowingId: number, carId: number, carShowingContent: CarStatistic.ShowingContent) {
    if (!carShowingContent.date || !carShowingContent.status || !carShowingContent.clientId) {
      throw new Error("Ошибка в параметрах редактируемого показа");
    }

    const allCarShowings = await this.prisma.carStatistic.findMany({where:{ carId: carId, type: CarStatistic.Type.showing }});

    const carShowingExist = allCarShowings.find(cs => {
      const content: CarStatistic.ShowingContent = JSON.parse(cs.content);

      return cs.id === carShowingId && content.clientId === carShowingContent.clientId;
    })

    if (!carShowingExist) {
      throw new Error("Показ этому клиенту не найден");
    }

    const result = await this.prisma.carStatistic.update({where:{id:carShowingExist.id}, data:{
      content: JSON.stringify(carShowingContent)
    }})

    return result;
  }

  async getCarShowingStatistic(carId: number): Promise<CarStatistic.CarShowingResponse[]> {
    const statisticRecords = await this.prisma.carStatistic.findMany({where:{ carId: carId, type: CarStatistic.Type.showing }});

    const result = statisticRecords.map(r => {
      return {
        ...r,
        content: JSON.parse(r.content)
      }
    })

    return result;
  }

  async getAllCarStatistic(carId: number): Promise<(CarStatistic.CarShowingResponse | CarStatistic.BaseResponse)[]> {
    const statisticRecords = await this.prisma.carStatistic.findMany({where:{ carId: carId }});

    const showingStatistics = statisticRecords.filter(rec => rec.type === CarStatistic.Type.showing).map(r => {
      return {
        ...r,
        content: JSON.parse(r.content) as CarStatistic.ShowingContent
      }
    }).filter(r => r.content.status !== CarStatistic.ShowingStatus.cancel).map(r => {
      if (r.content.status === CarStatistic.ShowingStatus.success) {
        r.date = BigInt(r.content.date);
      }

      return r;
    });

    const discountStatistics = statisticRecords.filter(rec => rec.type === CarStatistic.Type.customerDiscount).map(r => {
      return {
        ...r,
        content: JSON.parse(r.content) as CarStatistic.DiscountContent
      }
    })

    const callStatistics = statisticRecords.filter(rec => rec.type === CarStatistic.Type.call || rec.type === CarStatistic.Type.customerCall);

    return [...showingStatistics, ...callStatistics, ...discountStatistics];
  }

  async addCustomerCall(carId: number) {
    const timestamp = +(new Date());
    await this.prisma.carStatistic.create({data:{
      carId: carId,
      type: CarStatistic.Type.customerCall,
      date: timestamp,
      content: ''
    }})

    const fieldConfig = await this.prisma.fields.findFirst({where:{ name: FieldNames.Car.dateOfLastCustomerCall }}); // domain: FieldDomains.Car

    const fieldIdExist = await this.fieldChainService.findOne({
      sourceName: Models.Table.Cars,
      sourceId: carId,
      fieldId: fieldConfig.id,
    });

    if (fieldIdExist) {
      await this.fieldChainService.updateById(fieldIdExist.id, fieldIdExist.fieldId, { value: `${timestamp}` })
    } else {
      await this.fieldChainService.create({
        fieldId: fieldConfig.id,
        sourceId: carId,
        sourceName: Models.Table.Cars,
        value: `${timestamp}`
      })
    }

    return { carId };
  }

  async addCustomerDiscount(carId: number, discount: number, amount: number) {
    const fieldConfig = await this.prisma.fields.findFirst({where:{ name: FieldNames.Car.carOwnerPrice }}); // domain: FieldDomains.Car
    const fieldChain = await this.fieldChainService.findOne({
      sourceName: Models.Table.Cars,
      sourceId: carId,
      fieldId: fieldConfig.id,
    });

    if (amount !== +fieldChain.value) {
      throw ApiError.BadRequest(`Цена из запроса и цена из машины не сходяться.`); // Error codes
    }

    const timestamp = +(new Date());
    await this.prisma.carStatistic.create({data:{
      carId: carId,
      type: CarStatistic.Type.customerDiscount,
      date: timestamp,
      content: JSON.stringify({ amount, discount })
    }})

    await this.fieldChainService.updateById(fieldChain.id, fieldChain.fieldId, { value: `${+fieldChain.value - discount}` })

    return { carId };
  }
}
