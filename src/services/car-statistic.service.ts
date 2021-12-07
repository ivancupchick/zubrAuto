import { Models } from "../entities/Models";
import carStatisticRepository from "../repositories/base/car-statistic.repository";
import { CarStatistic } from "../entities/CarStatistic";

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

  async updateCarShowing(carId: number, carShowingContent: CarStatistic.ShowingContent) {
    if (!carShowingContent.date || !carShowingContent.status || !carShowingContent.clientId) {
      throw new Error("Ошибка в параметрах создаваемого показа");
    }

    const allCarShowings = await carStatisticRepository.find({ carId: [`${carId}`], type: [`${CarStatistic.Type.showing}`] });

    const carShowingExist = allCarShowings.find(cs => {
      const content: CarStatistic.ShowingContent = JSON.parse(cs.content);

      return content.clientId === carShowingContent.clientId;
    })

    if (!carShowingExist) {
      throw new Error("Показ этому клиенту не найден");
    }

    const result = await carStatisticRepository.updateById(carShowingExist.id, {
      content: JSON.stringify(carShowingContent)
    })

    return result;
  }

  async getCarStatistic(carId: number): Promise<Models.CarStatistic[]> {
    const statisticRecords = await carStatisticRepository.find({ carId: [`${carId}`] });

    return statisticRecords;
  }
}

export = new CarStatisticService();
