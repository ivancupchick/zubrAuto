import { Models } from "../entities/Models";
import carStatisticRepository from "../repositories/base/car-statistic.repository";
import { CarStatistic } from "../entities/CarStatistic";
import fieldRepository from "../repositories/base/field.repository";
import { FieldNames } from "../entities/FieldNames";
import fieldChainRepository from "../repositories/base/field-chain.repository";
import { ApiError } from "../exceptions/api.error";

class CarStatisticService {
  async addCall(carIds: number[]) {
    await Promise.all([
      ...carIds.map(id => {
        const timestamp = +(new Date());
        return carStatisticRepository.create({
          carId: id,
          type: CarStatistic.Type.call,
          date: timestamp,
          content: ''
        })
      })
    ])

    return { carIds };
  }

  async createCarShowing(carId: number, carShowingContent: CarStatistic.ShowingContent) {
    if (!carShowingContent.date || !carShowingContent.status || !carShowingContent.clientId) {
      throw new Error("Ошибка в параметрах создаваемого показа");
    }

    const timestamp = +(new Date());
    const result = await carStatisticRepository.create({
      carId,
      type: CarStatistic.Type.showing,
      date: timestamp,
      content: JSON.stringify(carShowingContent)
    })

    return result;
  }

  async updateCarShowing(carShowingId: number, carId: number, carShowingContent: CarStatistic.ShowingContent) {
    if (!carShowingContent.date || !carShowingContent.status || !carShowingContent.clientId) {
      throw new Error("Ошибка в параметрах редактируемого показа");
    }

    const allCarShowings = await carStatisticRepository.find({ carId: [`${carId}`], type: [`${CarStatistic.Type.showing}`] });

    const carShowingExist = allCarShowings.find(cs => {
      const content: CarStatistic.ShowingContent = JSON.parse(cs.content);

      return cs.id === carShowingId && content.clientId === carShowingContent.clientId;
    })

    if (!carShowingExist) {
      throw new Error("Показ этому клиенту не найден");
    }

    const result = await carStatisticRepository.updateById(carShowingExist.id, {
      content: JSON.stringify(carShowingContent)
    })

    return result;
  }

  async getCarShowingStatistic(carId: number): Promise<CarStatistic.CarShowingResponse[]> {
    const statisticRecords = await carStatisticRepository.find({ carId: [`${carId}`], type: [`${CarStatistic.Type.showing}`] });

    const result = statisticRecords.map(r => {
      return {
        ...r,
        content: JSON.parse(r.content)
      }
    })

    return result;
  }

  async getAllCarStatistic(carId: number): Promise<(CarStatistic.CarShowingResponse | CarStatistic.BaseResponse)[]> {
    const statisticRecords = await carStatisticRepository.find({ carId: [`${carId}`] });

    const showingStatistics = statisticRecords.filter(rec => rec.type === CarStatistic.Type.showing).map(r => {
      return {
        ...r,
        content: JSON.parse(r.content) as CarStatistic.ShowingContent
      }
    }).filter(r => r.content.status !== CarStatistic.ShowingStatus.cancel).map(r => {
      if (r.content.status === CarStatistic.ShowingStatus.success) {
        r.date = r.content.date;
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
    await carStatisticRepository.create({
      carId: carId,
      type: CarStatistic.Type.customerCall,
      date: timestamp,
      content: ''
    })

    const fieldConfig = await fieldRepository.findOne({ name: [`${FieldNames.Car.dateOfLastCustomerCall}`] });

    const fieldIdExist = await fieldChainRepository.findOne({
      sourceName: [`${Models.CARS_TABLE_NAME}`],
      sourceId: [`${carId}`],
      fieldId: [`${fieldConfig.id}`],
    });

    if (fieldIdExist) {
      await fieldChainRepository.updateById(fieldIdExist.id, { value: `${timestamp}` })
    } else {
      await fieldChainRepository.create({
        fieldId: fieldConfig.id,
        sourceId: carId,
        sourceName: Models.CARS_TABLE_NAME,
        value: `${timestamp}`
      })
    }

    return { carId };
  }

  async addCustomerDiscount(carId: number, discount: number, amount: number) {
    const fieldConfig = await fieldRepository.findOne({ name: [`${FieldNames.Car.carOwnerPrice}`] });
    const fieldChain = await fieldChainRepository.findOne({
      sourceName: [`${Models.CARS_TABLE_NAME}`],
      sourceId: [`${carId}`],
      fieldId: [`${fieldConfig.id}`],
    });

    if (amount !== +fieldChain.value) {
      throw ApiError.BadRequest(`Цена из запроса и цена из машины не сходяться.`); // Error codes
    }

    const timestamp = +(new Date());
    await carStatisticRepository.create({
      carId: carId,
      type: CarStatistic.Type.customerDiscount,
      date: timestamp,
      content: JSON.stringify({ amount, discount })
    })

    await fieldChainRepository.updateById(fieldChain.id, { value: `${+fieldChain.value - discount}` })

    return { carId };
  }
}

export = new CarStatisticService();
