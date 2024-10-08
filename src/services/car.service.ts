import { ServerCar } from "../entities/Car";
import { FieldDomains, RealField, ServerField } from "../entities/Field";
import { FieldNames } from "../entities/FieldNames";
import { Models } from "../entities/Models";
import { ICrudService } from "../entities/Types";
import { StringHash } from "../models/hashes";
import carFormRepository from "../repositories/base/car-form.repository";
import carOwnerRepository from "../repositories/base/car-owner.repository";
import carRepository from "../repositories/base/car.repository";
import fieldRepository from "../repositories/base/field.repository";
import { getEntityIdsByNaturalQuery } from "../utils/enitities-functions";
import { FieldsUtils, getFieldsWithValues } from "../utils/field.utils";
import carInfoGetterService from "./car-info-getter.service";
import fieldChainService from "./field-chain.service";
import fieldService from "./field.service";
import userService from "./user.service";

class CarService implements ICrudService<ServerCar.UpdateRequest, ServerCar.CreateRequest, ServerCar.Response, ServerCar.IdResponse> {
  private async getCars(
    cars: Models.Car[],
    carFields: ServerField.Response[],
    carOwners: Models.CarOwner[],
    carOwnerFields: ServerField.Response[],
  ) {

    if (cars.length === 0) {
      return [];
    }

    const [
      allCarChaines,
      allCarOwnerChaines,
      carForms
    ] = await Promise.all([
      (cars.length > 0 ? await fieldChainService.find({
        sourceName: [`${Models.Table.Cars}`],
        sourceId: cars.map(c => `${c.id}`),
      }) : []),
      (carOwners.length > 0 ? await fieldChainService.find({
        sourceName: [`${Models.Table.CarOwners}`],
        sourceId: carOwners.map(c => `${c.id}`),
      }) : []),

      (cars.length > 0 ? await carFormRepository.find({
        carId: cars.map(c => `${c.id}`)
      }) : [])
    ]);

    const contactCenterSpecialistIdField = carFields.find(f => f.name === FieldNames.Car.contactCenterSpecialistId);
    const workSheetField = carFields.find(f => f.name === FieldNames.Car.worksheet);
    const contactCenterSpecialistField = carFields.find(f => f.name === FieldNames.Car.contactCenterSpecialist);

    if (!contactCenterSpecialistIdField || !workSheetField || !contactCenterSpecialistField) {
      throw new Error("!contactCenterSpecialistIdField || !workSheetField || !contactCenterSpecialistField");
    }

    const allUsers = await userService.getAll();
    // const contactCenterSpecialistIdChaines = allCarChaines.filter(ch => ch.fieldId === contactCenterSpecialistIdField.id)
    // const contactCenterSpecialistChaines = allCarChaines.filter(ch => ch.fieldId === contactCenterSpecialistField.id)
    // const workSheetChaines = allCarChaines.filter(ch => ch.fieldId === workSheetField.id)

    const result: ServerCar.Response[] = cars.map(car => {
      const carChaines = allCarChaines.filter(ch => ch.sourceId === car.id)
      const carOwnerChaines = allCarOwnerChaines.filter(ch => ch.sourceId === car.ownerId)

      const carForm = carForms.find(form => form.carId === car.id);

      const userIdValue = carChaines.find(ch => ch.fieldId === contactCenterSpecialistIdField.id);
      const userId: number = userIdValue && userIdValue.value ? +userIdValue.value : -1;
      const user = allUsers.list.find(dbUser => dbUser.id === userId);

      if (carForm) {
        carChaines.find(ch => {
          if (ch.fieldId === workSheetField.id) {
            ch.value = carForm.content;
            return true;
          }

          return false
        });
      }

      if (user) {
        const r = carChaines.find(ch => {
          if (ch.fieldId === contactCenterSpecialistField.id) {
            ch.value = JSON.stringify(user);
            return true;
          }

          return false
        });

        if (!r) {
          carChaines.push({
            id: -1,
            sourceId: car.id,
            fieldId: contactCenterSpecialistField.id,
            value: JSON.stringify(user),
            sourceName: `${Models.Table.Cars}`
          });
        }
      }

      return {
        id: car.id,
        createdDate: car.createdDate,
        ownerId: car.ownerId,
        ownerNumber: carOwners.find(co => co.id === car.ownerId)?.number || '',
        fields: [
          ...getFieldsWithValues(carFields, carChaines, car.id),
          ...getFieldsWithValues(carOwnerFields, carOwnerChaines, car.ownerId)
        ]
      }
    });

    return result as any; //TODO
  }

  async get(id: number) {
    const [
      car,
      carFields,
      carOwnerFields,
    ] = await Promise.all([
      carRepository.findById(id),
      fieldService.getFieldsByDomain(FieldDomains.Car),
      fieldService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    const carOwner = await carOwnerRepository.findById(car.ownerId);

    const result = await this.getCars([car], carFields, [carOwner], carOwnerFields)

    return result[0];
  }

  async getAll() {
    const [
      cars,
      carFields,
      carOwners,
      carOwnerFields,
    ] = await Promise.all([
      carRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.Car),
      carOwnerRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    let list = await this.getCars(cars, carFields, carOwners, carOwnerFields);

    return {
      list: list,
      total: list.length
    };
  }

  async getCarsByQuery(query: StringHash) {
    const {
      page,
      size,
      sortOrder,
      sortField,
    } = query;
    delete query['page'];
    delete query['size'];
    delete query['sortOrder'];
    delete query['sortField'];

    const naturalFields = [
      'createdDate',
      'ownerId',
    ];

    let naturalQuery = {};

    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (naturalFields.includes(key)) {
          naturalQuery[key] = query[key];
          delete query[key];
        }
      }
    }

    const ownerFields = Object.values(FieldNames.CarOwner) as string[];

    let ownerQuery = {};

    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (ownerFields.includes(key)) {
          ownerQuery[key] = query[key];
          delete query[key];
        }
      }
    }

    let searchCarIds = Object.values(query).length ?  await fieldChainService.getEntityIdsByQuery(
      Models.Table.Cars,
      FieldDomains.Car,
      query
    ) : [];

    const ownerSearchCarIds = Object.values(ownerQuery).length ?  await fieldChainService.getEntityIdsByQuery(
      Models.Table.CarOwners,
      FieldDomains.CarOwner,
      ownerQuery
    ) : [];

    if (Object.values(ownerQuery)) {
      searchCarIds = searchCarIds.filter(id => ownerSearchCarIds.includes(id));
    }

    const naturalSearchCarIds = Object.values(naturalQuery).length || (sortField && naturalFields.includes(sortField)) ? await getEntityIdsByNaturalQuery(
      carRepository,
      naturalQuery
    ) : [];

    let carsIds = [...searchCarIds];

    if (searchCarIds.length && naturalSearchCarIds.length) {
      carsIds = searchCarIds.filter(id => naturalSearchCarIds.includes(id));
    }
    if (!searchCarIds.length && naturalSearchCarIds.length) {
      carsIds = [...naturalSearchCarIds];
    }

    if (sortField && sortOrder && !naturalFields.includes(sortField)) {
      const sortFieldConfig = await fieldRepository.findOne({
        name: [sortField]
      });

      if (sortFieldConfig && searchCarIds.length) {
        const sortChaines = await fieldChainService.find({
          fieldId: [`${sortFieldConfig.id}`],
          sourceId: searchCarIds,
          sourceName: [Models.Table.Users],
        }, sortOrder);

        carsIds = sortChaines.map(ch => `${ch.sourceId}`);
      }
    }

    if (page && size) {
      const start = (+page - 1) * +size;

      carsIds = carsIds.slice(start, start + +size);
    }

    const clientsResults = carsIds.length > 0 ? await carRepository.find({
      id: carsIds
    }) : [];

    const cars = carsIds.map(id => clientsResults.find(cr => +cr.id === +id));

    const [
      carFields,
      carOwners,
      carOwnerFields,
    ] = await Promise.all([
      fieldService.getFieldsByDomain(FieldDomains.Car),
      (cars.length > 0 ? await carOwnerRepository.find({
        id: cars.map(c => `${c.ownerId}`)
      }) : []),
      fieldService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    let list = await this.getCars(cars, carFields, carOwners, carOwnerFields);

    return {
      list: list,
      total: searchCarIds.length || naturalSearchCarIds.length
    };
  }

  private async getCarAndOwnerCarFields(carData: RealField.With.Request): Promise<[RealField.Request[], RealField.Request[]]> {
    const carOwnerFieldsConfigs = await fieldService.getFieldsByDomain(FieldDomains.CarOwner);

    const ownerFields = carData.fields.filter(f => !!carOwnerFieldsConfigs.find(fc => fc.id === f.id));
    const carFields = carData.fields.filter(f => !carOwnerFieldsConfigs.find(of => of.id === f.id));

    return [ownerFields, carFields];
  }

  async create(carData: ServerCar.CreateRequest) {
    const [ownerFields, carFields] = await this.getCarAndOwnerCarFields(carData);

    const existCarOwner = false; // await carOwnerRepository.findOne({ number: [`${carData.ownerNumber}`]});

    const ownerId = (await carOwnerRepository.create({ number: carData.ownerNumber })).id
    //  !existCarOwner
    //   ? (await carOwnerRepository.create({ number: carData.ownerNumber })).id
    //   : existCarOwner.id;

    // const existCarIds = await carRepository.find({ ownerId: [`${existCarOwner?.id || -1}` ]});

    const searchFields = await fieldRepository.find({ name: [FieldNames.Car.linkToAd]});
    const existCarChain = await fieldChainService.find({
      sourceName: [Models.Table.Cars],
      fieldId: searchFields.map(f => `${f.id}`),
      value: [FieldsUtils.getFieldValue(carData, FieldNames.Car.linkToAd)]
    });

    if (existCarChain.length > 0) {
      return { id: -1 };
    }

    // if (existCarIds.length > 0) {
    //   const fields = await fieldRepository.find({ name: [FieldNames.Car.mark, FieldNames.Car.model, FieldNames.Car.mileage]});
    //   const carFieldChains = (await Promise.all(
    //     existCarIds
    //       .map(car => fieldChainRepository.find({
    //         sourceName: [Models.Table.Cars],
    //         sourceId: [`${car.id}`],
    //         fieldId: fields.map(f => `${f.id}`)
    //       }))
    //   )).reduce(function(prev, next) {
    //     return prev.concat(next);
    //   });

    //   const realFields: (RealField.Response & { carId: number })[] = fields
    //     .map(f => ({
    //       ...f,
    //       carId: carFieldChains.find(cfc => cfc.fieldId === f.id)?.sourceId || -1,
    //       value: carFieldChains.find(cfc => cfc.fieldId === f.id)?.value || ''
    //     })).filter(f => f.carId !== -1);

    //   const realFieldsMatches: (RealField.Response & { carId: number })[] = realFields
    //     .filter(rf => {
    //       const field = carData.fields.find(f => f.id === rf.id);

    //       return rf.value === field?.value
    //     })

    //   let matches: { [key: number]: number[] } = {};

    //   realFieldsMatches.forEach(rfm => {
    //     if (!matches[rfm.carId]) {
    //       matches[rfm.carId] = [rfm.id];
    //     } else {
    //       matches[rfm.carId].push(rfm.id);
    //     }
    //   })

    //   let trueMatches = 0;

    //   for (const key in matches) {
    //     if (Object.prototype.hasOwnProperty.call(matches, key)) {
    //       const element = matches[key];

    //       if (element.length > 0) {
    //         ++trueMatches;
    //       }
    //     }
    //   }

    //   if (trueMatches > 0) {
    //     return { id: -1 };
    //   }
    // }

    if (!existCarOwner) {
      await Promise.all(ownerFields.map(f => fieldChainService.create({
        sourceId: ownerId,
        fieldId: f.id,
        value: f.value,
        sourceName: Models.Table.CarOwners
      })));
    } else {
      // await carOwnerRepository.updateById(existCarOwner.id, { // not need
      //   id: 0,
      //   number: carData.ownerNumber
      // })
      await Promise.all(ownerFields.map(f => fieldChainService.update({
        value: f.value
      }, {
        fieldId: [`${f.id}`],
        sourceId: [`${ownerId}`],
        sourceName: [Models.Table.CarOwners]
      })));
    }

    const statusField = await fieldRepository.findOne({ name: [`${FieldNames.Car.status}`], domain: [`${FieldDomains.Car}`] });

    if (statusField) {
      const statusFieldRequest: RealField.Request = {
        id: statusField.id,
        name: FieldNames.Car.status,
        value: 'status-0'
      }
      const statusFieldRequestExist = carFields.find(f => f.id === statusFieldRequest.id)

      if (!statusFieldRequestExist || !statusFieldRequestExist.value) {
        carFields.push(statusFieldRequest);
      }
    }

    const car = await carRepository.create({
      createdDate: `${(new Date()).getTime()}`,
      ownerId
    });
    await Promise.all(carFields.map(f => fieldChainService.create({
      sourceId: car.id,
      fieldId: f.id,
      value: f.value,
      sourceName: Models.Table.Cars
    })));

    return { id: car.id };
  }

  async manualCreate(carData: ServerCar.CreateRequest) {
    const [ownerFields, carFields] = await this.getCarAndOwnerCarFields(carData);

    const existCarOwner = false; // await carOwnerRepository.findOne({ number: [`${carData.ownerNumber}`]});

    const ownerId = (await carOwnerRepository.create({ number: carData.ownerNumber })).id
    //  !existCarOwner
    //   ? (await carOwnerRepository.create({ number: carData.ownerNumber })).id
    //   : existCarOwner.id;

    // const existCarIds = await carRepository.find({ ownerId: [`${existCarOwner?.id || -1}` ]});

    // const searchFields = await fieldRepository.find({ name: [FieldNames.Car.linkToAd]});
    // const existCarChain = await fieldChainRepository.find({
    //   sourceName: [Models.Table.Cars],
    //   fieldId: searchFields.map(f => `${f.id}`),
    //   value: [FieldsUtils.getFieldValue(carData, FieldNames.Car.linkToAd)]
    // });

    // if (existCarChain.length > 0) {
    //   return { id: -1 };
    // }

    // if (existCarIds.length > 0) {
    //   const fields = await fieldRepository.find({ name: [FieldNames.Car.mark, FieldNames.Car.model, FieldNames.Car.mileage]});
    //   const carFieldChains = (await Promise.all(
    //     existCarIds
    //       .map(car => fieldChainRepository.find({
    //         sourceName: [Models.Table.Cars],
    //         sourceId: [`${car.id}`],
    //         fieldId: fields.map(f => `${f.id}`)
    //       }))
    //   )).reduce(function(prev, next) {
    //     return prev.concat(next);
    //   });

    //   const realFields: (RealField.Response & { carId: number })[] = fields
    //     .map(f => ({
    //       ...f,
    //       carId: carFieldChains.find(cfc => cfc.fieldId === f.id)?.sourceId || -1,
    //       value: carFieldChains.find(cfc => cfc.fieldId === f.id)?.value || ''
    //     })).filter(f => f.carId !== -1);

    //   const realFieldsMatches: (RealField.Response & { carId: number })[] = realFields
    //     .filter(rf => {
    //       const field = carData.fields.find(f => f.id === rf.id);

    //       return rf.value === field?.value
    //     })

    //   let matches: { [key: number]: number[] } = {};

    //   realFieldsMatches.forEach(rfm => {
    //     if (!matches[rfm.carId]) {
    //       matches[rfm.carId] = [rfm.id];
    //     } else {
    //       matches[rfm.carId].push(rfm.id);
    //     }
    //   })

    //   let trueMatches = 0;

    //   for (const key in matches) {
    //     if (Object.prototype.hasOwnProperty.call(matches, key)) {
    //       const element = matches[key];

    //       if (element.length > 0) {
    //         ++trueMatches;
    //       }
    //     }
    //   }

    //   if (trueMatches > 0) {
    //     return { id: -1 };
    //   }
    // }

    if (!existCarOwner) {
      await Promise.all(ownerFields.map(f => fieldChainService.create({
        sourceId: ownerId,
        fieldId: f.id,
        value: f.value,
        sourceName: Models.Table.CarOwners
      })));
    } else {
      // await carOwnerRepository.updateById(existCarOwner.id, { // not need
      //   id: 0,
      //   number: carData.ownerNumber
      // })
      await Promise.all(ownerFields.map(f => fieldChainService.update({
        value: f.value
      }, {
        fieldId: [`${f.id}`],
        sourceId: [`${ownerId}`],
        sourceName: [Models.Table.CarOwners]
      })));
    }

    const statusField = await fieldRepository.findOne({ name: [`${FieldNames.Car.status}`], domain: [`${FieldDomains.Car}`] });

    if (statusField) {
      const statusFieldRequest: RealField.Request = {
        id: statusField.id,
        name: FieldNames.Car.status,
        value: 'status-0'
      }
      const statusFieldRequestExist = carFields.find(f => f.id === statusFieldRequest.id)

      if (!statusFieldRequestExist || !statusFieldRequestExist.value) {
        carFields.push(statusFieldRequest);
      }
    }

    const car = await carRepository.create({
      createdDate: `${(new Date()).getTime()}`,
      ownerId
    });
    await Promise.all(carFields.map(f => fieldChainService.create({
      sourceId: car.id,
      fieldId: f.id,
      value: f.value,
      sourceName: Models.Table.Cars
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

    await Promise.all(ownerFields.map(f => fieldChainService.update({
      value: f.value
    }, {
      fieldId: [`${f.id}`],
      sourceId: [`${carOwner.id}`],
      sourceName: [Models.Table.CarOwners]
    })));

    if (needUpdate) {
      await carRepository.updateById(carId, { ownerId: carOwner.id });
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

    const fieldsExists = await fieldChainService.find({
      sourceName: [Models.Table.Cars],
      sourceId: [`${carId}`],
    });

    const fieldChainForCreate = carFields.filter(f => !fieldsExists.find(fe => fe.fieldId === f.id))

    const cf = carFields.filter(f => f.name !== FieldNames.Car.worksheet);
    await Promise.all(cf.map(f => fieldChainService.update({
      value: f.value
    }, {
      fieldId: [`${f.id}`],
      sourceId: [`${carId}`],
      sourceName: [Models.Table.Cars]
    })));

    if (fieldChainForCreate.length > 0) {
      await Promise.all(fieldChainForCreate.map(f => fieldChainService.create({
        sourceId: carId,
        fieldId: f.id,
        value: f.value,
        sourceName: Models.Table.Cars
      })));
    }

    return { id: carId };
  }

  async delete(id: number) {
    await fieldChainService.delete({
      sourceName: [Models.Table.Cars],
      sourceId: [`${id}`],
    });

    const car = await carRepository.deleteById(id);
    return car
  }

  async deleteCars(ids: number[]) {
    // const chaines = await fieldChainRepository.find({
    //   sourceName: [Models.Table.Cars],
    //   sourceId: ids.map(id => `${id}`),
    // });
    await fieldChainService.delete({
      sourceName: [Models.Table.Cars],
      sourceId: ids.map(id => `${id}`),
    });
    // await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
    const cars = await carRepository.delete({ id: ids.map(id => `${id}`) });
    return cars
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

  async createCarsByManager(data: ServerCar.CreateByManager): Promise<(ServerCar.Response | ServerCar.IdResponse)[]> {
    const [
      carFields,
      carOwnerFields
    ] = await Promise.all([
      fieldService.getFieldsByDomain(FieldDomains.Car),
      fieldService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    const createCarData = await carInfoGetterService.getCarsInfoByManualInfo(data.cars, carFields, carOwnerFields, data.specialist);

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
