import { ServerCar } from "../entities/Car";
import { FieldDomains, RealField } from "../entities/Field";
import { Models } from "../entities/Models";
import carOwnerRepository from "../repositories/base/car-owner.repository";
import carRepository from "../repositories/base/car.repository";
import fieldChainRepository from "../repositories/base/field-chain.repository";
import { getFieldsWithValues } from "../utils/field.utils";
import fieldChainService from "./field-chain.service";
import fieldService from "./field.service";

class CarService {
  async getAllCars(): Promise<ServerCar.GetResponse[]> {
    const [
      cars,
      carFields,
      carOwners,
      carOwnerFields

    ] = await Promise.all([
      carRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.Car),
      carOwnerRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    const [
      carChaines,
      carOwnerChaines
    ] = await Promise.all([
      await fieldChainRepository.find({
        sourceId: cars.map(c => `${c.id}`),
        sourceName: [`'${Models.CARS_TABLE_NAME}'`]
      }),
      await fieldChainRepository.find({
        sourceId: carOwners.map(c => `${c.id}`),
        sourceName: [`'${Models.CAR_OWNERS_TABLE_NAME}'`]
      })
    ]);

    const result: ServerCar.GetResponse[] = cars.map(car => ({
      id: car.id,
      createdDate: car.createdDate,
      ownerId: car.ownerId,
      ownerNumber: carOwners.find(co => co.id === car.ownerId)?.number || '',
      fields: [
        ...getFieldsWithValues(carFields, carChaines, car.id),
        ...getFieldsWithValues(carOwnerFields, carOwnerChaines, car.ownerId)
      ]
    }))

    return result;
  }

  private async getCarAndOwnerCarFields(carData: RealField.With.Request): Promise<[RealField.Request[], RealField.Request[]]> {
    const carOwnerFieldsConfigs = await fieldService.getFieldsByDomain(FieldDomains.CarOwner);

    const ownerFields = carData.fields.filter(f => !!carOwnerFieldsConfigs.find(fc => fc.id === f.id));
    const carFields = carData.fields.filter(f => !ownerFields.find(of => of.id === f.id));

    return [ownerFields, carFields];
  }

  async createCar(carData: ServerCar.CreateRequest): Promise<any> {
    const [ownerFields, carFields] = await this.getCarAndOwnerCarFields(carData);

    const existCarOwner = await carOwnerRepository.findOne({ number: [`${carData.ownerNumber}`]});
    console.log(existCarOwner);
    const ownerId = !existCarOwner
      ? (await carOwnerRepository.create({ id: 0, number: carData.ownerNumber })).id
      : existCarOwner.id;
    if (!existCarOwner) {
      await Promise.all(ownerFields.map(f => fieldChainService.createFieldChain({
        id: 0,
        sourceId: ownerId,
        fieldId: f.id,
        value: f.value,
        sourceName: Models.CAR_OWNERS_TABLE_NAME
      })));
    } else {
      // await carOwnerRepository.updateById(existCarOwner.id, { // not need
      //   id: 0,
      //   number: carData.ownerNumber
      // })
      await Promise.all(ownerFields.map(f => fieldChainRepository.update({
        value: f.value
      }, {
        fieldId: [`${f.id}`],
        sourceId: [`${ownerId}`],
        sourceName: [Models.CAR_OWNERS_TABLE_NAME]
      })));
    }

    const car = await carRepository.create({
      id: 0,
      createdDate: carData.createdDate,
      ownerId
    });
    await Promise.all(carFields.map(f => fieldChainService.createFieldChain({
      id: 0,
      sourceId: car.id,
      fieldId: f.id,
      value: f.value,
      sourceName: Models.CARS_TABLE_NAME
    })));

    return { fields: carFields, ...car, ownerNumber: carData.ownerNumber };
  }

  async updateCar(carId: number, carData: ServerCar.UpdateRequest): Promise<any> {
    const [ownerFields, carFields] = await this.getCarAndOwnerCarFields(carData);

    const existCarOwnerById = await carOwnerRepository.findOne({ id: [`${carData.ownerId}`]});
    const existCarOwnerByNumber = await carOwnerRepository.findOne({ number: [`${carData.ownerNumber}`]});

    let carOwner = existCarOwnerById;

    if (!existCarOwnerByNumber && carData.ownerNumber) {
      carOwner = await carOwnerRepository.updateById(carData.ownerId, { id: 0, number: carData.ownerNumber });
    } else if (existCarOwnerById.number === existCarOwnerByNumber.number) {

    } else if (existCarOwnerById && existCarOwnerByNumber && existCarOwnerByNumber.number !== existCarOwnerById.number) {
      carData.ownerId = existCarOwnerByNumber.id;
      carOwner = existCarOwnerByNumber;
    }

    await Promise.all(ownerFields.map(f => fieldChainRepository.update({
      value: f.value
    }, {
      fieldId: [`${f.id}`],
      sourceId: [`${carOwner.id}`],
      sourceName: [Models.CAR_OWNERS_TABLE_NAME]
    })));

    const car = await carRepository.updateById(carId, {
      id: 0,
      createdDate: carData.createdDate,
      ownerId: carData.ownerId
    });
    await Promise.all(carFields.map(f => fieldChainRepository.update({
      value: f.value
    }, {
      fieldId: [`${f.id}`],
      sourceId: [`${carId}`],
      sourceName: [Models.CARS_TABLE_NAME]
    })));

    return { fields: carFields, ...car, ownerNumber: carData.ownerNumber };
  }

  async deleteCar(id: number) {
    const chaines = await fieldChainRepository.find({
      sourceId: [`${id}`],
      sourceName: [Models.CARS_TABLE_NAME]
    });
    await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
    const car = await carRepository.deleteById(id);
    return car
  }

  async getCar(id: number): Promise<ServerCar.GetResponse> {
    const [
      car,
      carFields,
      carOwnerFields
    ] = await Promise.all([
      carRepository.findById(id),
      fieldService.getFieldsByDomain(FieldDomains.Car),
      fieldService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    const carOwner = await  carOwnerRepository.findById(car.ownerId);

    const [
      carChaines,
      carOwnerChaines
    ] = await Promise.all([
      await fieldChainRepository.find({
        sourceId: [`${car.id}`],
        sourceName: [`'${Models.CARS_TABLE_NAME}'`]
      }),
      await fieldChainRepository.find({
        sourceId: [`${carOwner.id}`],
        sourceName: [`'${Models.CAR_OWNERS_TABLE_NAME}'`]
      })
    ]);

    const result: ServerCar.GetResponse = {
      id: car.id,
      createdDate: car.createdDate,
      ownerId: car.ownerId,
      ownerNumber: carOwner.number,
      fields: [
        ...getFieldsWithValues(carFields, carChaines, car.id),
        ...getFieldsWithValues(carOwnerFields, carOwnerChaines, car.ownerId)
      ]
    };

    return result;
  }
}

export = new CarService();
