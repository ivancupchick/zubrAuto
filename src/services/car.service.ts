import { ServerCar } from "../entities/Car";
import { FieldDomains, FieldType, RealField, ServerField } from "../entities/Field";
import { FieldNames } from "../entities/FieldNames";
import { Models } from "../entities/Models";
import { ICrudService } from "../entities/Types";
import carFormRepository from "../repositories/base/car-form.repository";
import carOwnerRepository from "../repositories/base/car-owner.repository";
import carRepository from "../repositories/base/car.repository";
import fieldChainRepository from "../repositories/base/field-chain.repository";
import fieldRepository from "../repositories/base/field.repository";
import { FieldsUtils, getFieldsWithValues } from "../utils/field.utils";
import { ExpressionHash, StringHash } from "../utils/sql-queries";
import carInfoGetterService from "./car-info-getter.service";
import fieldChainService from "./field-chain.service";
import fieldService from "./field.service";
import userService from "./user.service";

function getFieldChainsValue(query: StringHash, fields: Models.Field[]): string[] {
  fields.forEach(f => {
    if (f.type === FieldType.Dropdown || FieldType.Multiselect) {
      const needVariants = query[f.name].split(',');
      query[f.name] = needVariants.map(v => {
        if (f.variants) {
          const index = f.variants.split(',').findIndex(vValue => vValue === v);

          return `${f.name}-${index}`;
        }

        return query[f.name];
      }).join(',')
    }
  });

  const queryValues = fields.map(f => f.name).map(k => query[k].split(','));
  const rValues: string[] = [];
  queryValues.forEach(queryValue => {
    queryValue.forEach(vv => rValues.push(vv));
  })

  return rValues;
}

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
      (cars.length > 0 ? await fieldChainRepository.find({
        sourceName: [`${Models.CARS_TABLE_NAME}`],
        sourceId: cars.map(c => `${c.id}`),
      }) : []),
      (carOwners.length > 0 ? await fieldChainRepository.find({
        sourceName: [`${Models.CAR_OWNERS_TABLE_NAME}`],
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
      const user = allUsers.find(dbUser => dbUser.id === userId);

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
            sourceName: `${Models.CARS_TABLE_NAME}`
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

    return result;
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

    return this.getCars(cars, carFields, carOwners, carOwnerFields);
  }

  async getCarsByQuery(query: StringHash) {
    const {
      page,
      size,
    } = query;
    delete query['page'];
    delete query['size'];

    const searchCarIds = await this.getSearchCars(
      Models.CARS_TABLE_NAME,
      FieldDomains.Car,
      query
    );

    let carIds = [...searchCarIds];

    if (page && size) {
      const start = (+page - 1) * +size;

      carIds = carIds.slice(start, start + +size);
    }

    const cars = carIds.length > 0 ? await carRepository.find({
      id: carIds
    }) : [];

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

    return this.getCars(cars, carFields, carOwners, carOwnerFields);
  }

  async getSearchCars(sourceName: string, domain: FieldDomains, query: StringHash) {
    const carIds = new Set<string>((query['id'])?.split(',') || []);
    delete query['id'];

    const fieldNames = Object.keys(query);

    const carFields =
      fieldNames.length > 0
        ? await fieldRepository.find({
            domain: [`${FieldDomains.Car}`],
            name: fieldNames,
          })
        : [];

    const needCarChainesOptions: ExpressionHash<Models.FieldChain> = {
      sourceName: [sourceName],
    }

    if (carIds && carIds.size > 0) {
      needCarChainesOptions.sourceId = [...carIds];
    }

    if (carFields.length > 0) {
      needCarChainesOptions.fieldId = carFields.map(f => `${f.id}`);
      needCarChainesOptions.value = getFieldChainsValue(query, carFields);
    }

    const needCarChaines = carFields.length > 0 ? await fieldChainRepository.find(needCarChainesOptions) : [];

    const searchCarIds = new Set<string>();

    const matchObj: ExpressionHash<any> = {};

    if (needCarChaines.length > 0) {
      needCarChaines.forEach(ch => {
        if (!matchObj[ch.fieldId]) {
          matchObj[ch.fieldId] = [];
        }
        matchObj[ch.fieldId].push(`${ch.sourceId}`);
      });

      const matchKeys = carFields.map(f => `${f.id}`);;

      needCarChaines.forEach(ch => {
        let currentMatch = 0;

        matchKeys.forEach(key => {
          if (matchObj[key] && matchObj[key].includes(`${ch.sourceId}`)) {
            ++currentMatch;
          }
        })

        if (currentMatch === matchKeys.length) {
          searchCarIds.add(`${ch.sourceId}`);
        }
      });
    }

    return [...searchCarIds];
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
    const existCarChain = await fieldChainRepository.find({
      sourceName: [Models.CARS_TABLE_NAME],
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
    //         sourceName: [Models.CARS_TABLE_NAME],
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

    const fieldsExists = await fieldChainRepository.find({
      sourceName: [Models.CARS_TABLE_NAME],
      sourceId: [`${carId}`],
    });

    const fieldChainForCreate = carFields.filter(f => !fieldsExists.find(fe => fe.fieldId === f.id))

    const cf = carFields.filter(f => f.name !== FieldNames.Car.worksheet);
    await Promise.all(cf.map(f => fieldChainRepository.update({
      value: f.value
    }, {
      fieldId: [`${f.id}`],
      sourceId: [`${carId}`],
      sourceName: [Models.CARS_TABLE_NAME]
    })));

    if (fieldChainForCreate.length > 0) {
      await Promise.all(fieldChainForCreate.map(f => fieldChainService.createFieldChain({
        sourceId: carId,
        fieldId: f.id,
        value: f.value,
        sourceName: Models.CARS_TABLE_NAME
      })));
    }

    return { id: carId };
  }

  async delete(id: number) {
    const chaines = await fieldChainRepository.find({
      sourceName: [Models.CARS_TABLE_NAME],
      sourceId: [`${id}`],
    });
    await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
    const car = await carRepository.deleteById(id);
    return car
  }

  async deleteCars(ids: number[]) {
    // const chaines = await fieldChainRepository.find({
    //   sourceName: [Models.CARS_TABLE_NAME],
    //   sourceId: ids.map(id => `${id}`),
    // });
    await fieldChainRepository.delete({
      sourceName: [Models.CARS_TABLE_NAME],
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
}

export = new CarService();
