import { ServerCar } from "../entities/Car";
import { FieldDomains, RealField } from "../entities/Field";
import { FieldNames } from "../entities/FieldNames";
import { Models } from "../entities/Models";
import { ICrudService } from "../entities/Types";
import carFormRepository from "../repositories/base/car-form.repository";
import carOwnerRepository from "../repositories/base/car-owner.repository";
import carRepository from "../repositories/base/car.repository";
import fieldChainRepository from "../repositories/base/field-chain.repository";
import fieldRepository from "../repositories/base/field.repository";
import userRepository from "../repositories/base/user.repository";
import { getFieldsWithValues } from "../utils/field.utils";
import carInfoGetterService from "./car-info-getter.service";
import fieldChainService from "./field-chain.service";
import fieldService from "./field.service";
import userService from "./user.service";

class CarService implements ICrudService<ServerCar.CreateRequest, ServerCar.UpdateRequest, ServerCar.Response, ServerCar.IdResponse> {
  async getAll() {
    const [
      cars,
      carFields,
      carOwners,
      carOwnerFields,
      carForms,
    ] = await Promise.all([
      carRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.Car),
      carOwnerRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.CarOwner),
      carFormRepository.getAll(),
    ]);

    const [
      allCarChaines,
      allCarOwnerChaines
    ] = await Promise.all([
      await fieldChainRepository.find({
        sourceId: cars.map(c => `${c.id}`),
        sourceName: [`${Models.CARS_TABLE_NAME}`]
      }),
      await fieldChainRepository.find({
        sourceId: carOwners.map(c => `${c.id}`),
        sourceName: [`${Models.CAR_OWNERS_TABLE_NAME}`]
      })
    ]);

    const allUsers = await userService.getAll();

    const result: ServerCar.Response[] = cars.map(car => {
      const carForm = carForms.find(form => form.carId === car.id);
      const workSheetField = carFields.find(f => f.name === FieldNames.Car.worksheet);


      const userIdField = carFields.find(f => f.name === FieldNames.Car.contactCenterSpecialistId);
      const userIdValue = allCarChaines.find(ch => ch.fieldId === userIdField.id && ch.sourceId === car.id && ch.sourceName === Models.CARS_TABLE_NAME);


      // const userIdField = carFields.find(f => f.name === FieldNames.Car.contactCenterSpecialistId)
      // const userIdValue = carChaines.find(f => f.fieldId === userIdField.id);
      console.log(`${allUsers[0].id} === ${+(userIdValue || {}).value}`)
      const user = allUsers.find(dbUser => dbUser.id === +(userIdValue || {}).value);
      const userField = carFields.find(f => f.name === FieldNames.Car.contactCenterSpecialist);

      if (carForm && workSheetField) {
        allCarChaines.forEach(ch => {
          if (ch.fieldId === workSheetField.id && ch.sourceId === car.id && ch.sourceName === Models.CARS_TABLE_NAME) {
            ch.value = carForm.content;
          }
        });
      }

      if (user && userField) {
        allCarChaines.forEach(ch => {
          if (ch.fieldId === userField.id && ch.sourceId === car.id && ch.sourceName === Models.CARS_TABLE_NAME) {
            ch.value = JSON.stringify(user);
          }
        });
      }


      const carRealFields = getFieldsWithValues(carFields, allCarChaines, car.id)
      return {
        id: car.id,
        createdDate: car.createdDate,
        ownerId: car.ownerId,
        ownerNumber: carOwners.find(co => co.id === car.ownerId)?.number || '',
        fields: [
          ...carRealFields,
          ...getFieldsWithValues(carOwnerFields, allCarOwnerChaines, car.ownerId)
        ]
      }
    });

    return result;
  }

  private async getCarAndOwnerCarFields(carData: RealField.With.Request): Promise<[RealField.Request[], RealField.Request[]]> {
    const carOwnerFieldsConfigs = await fieldService.getFieldsByDomain(FieldDomains.CarOwner);

    const ownerFields = carData.fields.filter(f => !!carOwnerFieldsConfigs.find(fc => fc.id === f.id));
    const carFields = carData.fields.filter(f => !carOwnerFieldsConfigs.find(of => of.id === f.id));

    return [ownerFields, carFields];
  }

  async create(carData: ServerCar.CreateRequest) {
    const [ownerFields, carFields] = await this.getCarAndOwnerCarFields(carData);

    const existCarOwner = await carOwnerRepository.findOne({ number: [`${carData.ownerNumber}`]});

    const ownerId = !existCarOwner
      ? (await carOwnerRepository.create({ number: carData.ownerNumber })).id
      : existCarOwner.id;

    const existCarIds = await carRepository.find({ ownerId: [`${existCarOwner?.id || -1}` ]});

    if (existCarIds.length > 0) {
      const fields = await fieldRepository.find({ name: [FieldNames.Car.mark, FieldNames.Car.model, FieldNames.Car.mileage]});
      const carFieldChains = (await Promise.all(
        existCarIds
          .map(car => fieldChainRepository.find({
            sourceId: [`${car.id}`],
            sourceName: [Models.CARS_TABLE_NAME],
            fieldId: fields.map(f => `${f.id}`)
          }))
      )).reduce(function(prev, next) {
        return prev.concat(next);
      });

      const realFields: (RealField.Response & { carId: number })[] = fields
        .map(f => ({
          ...f,
          carId: carFieldChains.find(cfc => cfc.fieldId === f.id)?.sourceId || -1,
          value: carFieldChains.find(cfc => cfc.fieldId === f.id)?.value || ''
        })).filter(f => f.carId !== -1);

      const realFieldsMatches: (RealField.Response & { carId: number })[] = realFields
        .filter(rf => {
          const field = carData.fields.find(f => f.id === rf.id);

          return rf.value === field.value
        })

      let matches: { [key: number]: number[] } = {};

      realFieldsMatches.forEach(rfm => {
        if (!matches[rfm.carId]) {
          matches[rfm.carId] = [rfm.id];
        } else {
          matches[rfm.carId].push(rfm.id);
        }
      })

      let trueMatches = 0;

      for (const key in matches) {
        if (Object.prototype.hasOwnProperty.call(matches, key)) {
          const element = matches[key];

          if (element.length > 0) {
            ++trueMatches;
          }
        }
      }

      if (trueMatches > 0) {
        return { id: -1 };
      }
    }

    if (!existCarOwner) {
      await Promise.all(ownerFields.map(f => fieldChainService.createFieldChain({
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
      createdDate: (new Date()).getTime().toString(),
      ownerId
    });
    await Promise.all(carFields.map(f => fieldChainService.createFieldChain({
      sourceId: car.id,
      fieldId: f.id,
      value: f.value,
      sourceName: Models.CARS_TABLE_NAME
    })));

    return { id: car.id };
  }

  async update(carId: number, carData: ServerCar.UpdateRequest) {
    const [ownerFields, carFields] = await this.getCarAndOwnerCarFields(carData);
    let needUpdate = false;

    const existCar = await carRepository.findById(carId);
    const existCarOwnerById = await carOwnerRepository.findOne({ id: [`${existCar.ownerId}`]});
    const existCarOwnerByNumber = carData.ownerNumber ? await carOwnerRepository.findOne({ number: [`${carData.ownerNumber}`]}) : null;

    let carOwner = existCarOwnerById;

    if (!existCarOwnerByNumber && carData.ownerNumber) {
      carOwner = await carOwnerRepository.updateById(existCar.ownerId, { number: carData.ownerNumber });
    // } else if (existCarOwnerById.number === existCarOwnerByNumber.number) {

    } else if (existCarOwnerById && existCarOwnerByNumber && existCarOwnerByNumber.number !== existCarOwnerById.number) {
      carData = Object.assign({}, carData, { ownerId: existCarOwnerByNumber.id});
      carOwner = existCarOwnerByNumber;
      needUpdate = true;
    }

    await Promise.all(ownerFields.map(f => fieldChainRepository.update({
      value: f.value
    }, {
      fieldId: [`${f.id}`],
      sourceId: [`${carOwner.id}`],
      sourceName: [Models.CAR_OWNERS_TABLE_NAME]
    })));

    if (needUpdate) {
      delete carData.fields;
      await carRepository.updateById(carId, carData as Partial<Models.Car>);
    }

    const worksheetField = carFields.find(f => f.name === FieldNames.Car.worksheet);

    if (worksheetField && worksheetField.value) {
      const carFormExist = await carFormRepository.findOne({ carId: [`${carId}`]});

      if (carFormExist) {
        await carFormRepository.updateById(carFormExist.id, { content: worksheetField.value });
      } else {
        await carFormRepository.create({ carId, content: worksheetField.value });
      }
    }

    const cf = carFields.filter(f => f.name !== FieldNames.Car.worksheet);
    await Promise.all(cf.map(f => fieldChainRepository.update({
      value: f.value
    }, {
      fieldId: [`${f.id}`],
      sourceId: [`${carId}`],
      sourceName: [Models.CARS_TABLE_NAME]
    })));

    return { id: carId };
  }

  async delete(id: number) {
    const chaines = await fieldChainRepository.find({
      sourceId: [`${id}`],
      sourceName: [Models.CARS_TABLE_NAME]
    });
    await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
    const car = await carRepository.deleteById(id);
    return car
  }

  async get(id: number) {
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
        sourceName: [`${Models.CARS_TABLE_NAME}`]
      }),
      await fieldChainRepository.find({
        sourceId: [`${carOwner.id}`],
        sourceName: [`${Models.CAR_OWNERS_TABLE_NAME}`]
      })
    ]);

    const result: ServerCar.Response = {
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

  async createCarsByLink(data: ServerCar.CreateByLink): Promise<(ServerCar.Response | ServerCar.IdResponse)[]> {
    const [
      carFields,
      carOwnerFields
    ] = await Promise.all([
      fieldService.getFieldsByDomain(FieldDomains.Car),
      fieldService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    const queries = data.link.split('?')[1];

    const createCarData = await carInfoGetterService.getCarsInfo(queries, carFields, carOwnerFields, data.userId);

    if (createCarData.length === 0) {
      return [];
    }

    const createdCarIds = await Promise.all(createCarData.map(cc => this.create(cc)))

    const result = createdCarIds.map((r, i) => {
      if (r.id === -1) {
        const carData = createCarData[i];

        return { ...carData, id: -1 }; // TODO! Maybe rethink minor errors for all apies...
      }

      return {...r};
    })

    return result;
  }
}

export = new CarService();
