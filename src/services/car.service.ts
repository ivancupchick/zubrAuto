import { ServerCar } from "../entities/Car";
import { FieldDomains, FieldType, RealField, ServerField } from "../entities/Field";
import { FieldNames } from "../entities/FieldNames";
import { Models } from "../entities/Models";
import { ICrudService } from "../entities/Types";
import carQuestionnaireRepository from "../repositories/base/car-form.repository";
import carOwnerRepository from "../repositories/base/car-owner.repository";
import carRepository from "../repositories/base/car.repository";
import fieldChainRepository from "../repositories/base/field-chain.repository";
import fieldRepository from "../repositories/base/field.repository";
import { getFieldsWithValues } from "../utils/field.utils";
import { ExpressionHash, StringHash } from "../utils/sql-queries";
import carInfoGetterService from "./car-info-getter.service";
import fieldChainService from "./field-chain.service";
import fieldService from "./field.service";
import userService from "./user.service";

class CarService implements ICrudService<ServerCar.CreateRequest, ServerCar.UpdateRequest, ServerCar.Response, ServerCar.IdResponse> {
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
      carQuestionnaires
    ] = await Promise.all([
      (cars.length > 0 ? await fieldChainRepository.find({
        sourceName: [`${Models.CARS_TABLE_NAME}`],
        sourceId: cars.map(c => `${c.id}`),
      }) : []),
      (carOwners.length > 0 ? await fieldChainRepository.find({
        sourceName: [`${Models.CAR_OWNERS_TABLE_NAME}`],
        sourceId: carOwners.map(c => `${c.id}`),
      }) : []),

      (cars.length > 0 ? await carQuestionnaireRepository.find({
        carId: cars.map(c => `${c.id}`)
      }) : [])
    ]);

    const contactCenterSpecialistIdField = carFields.find(f => f.name === FieldNames.Car.contactCenterSpecialistId);
    const carQuestionnaireField = carFields.find(f => f.name === FieldNames.Car.carQuestionnaire);
    const contactCenterSpecialistField = carFields.find(f => f.name === FieldNames.Car.contactCenterSpecialist);

    if (!contactCenterSpecialistIdField || !carQuestionnaireField || !contactCenterSpecialistField) {
      throw new Error("!contactCenterSpecialistIdField || !carQuestionnaireField || !contactCenterSpecialistField");
    }

    const allUsers = await userService.getAll();
    // const contactCenterSpecialistIdChaines = allCarChaines.filter(ch => ch.fieldId === contactCenterSpecialistIdField.id)
    // const contactCenterSpecialistChaines = allCarChaines.filter(ch => ch.fieldId === contactCenterSpecialistField.id)
    // const carQuestionnaireChaines = allCarChaines.filter(ch => ch.fieldId === carQuestionnaireField.id)

    const result: ServerCar.Response[] = cars.map(car => {
      const carChaines = allCarChaines.filter(ch => ch.sourceId === car.id)
      const carOwnerChaines = allCarOwnerChaines.filter(ch => ch.sourceId === car.ownerId)

      const carQuestionnaire = carQuestionnaires.find(form => form.carId === car.id);

      const userIdValue = carChaines.find(ch => ch.fieldId === contactCenterSpecialistIdField.id);
      const userId: number = userIdValue && userIdValue.value ? +userIdValue.value : -1;
      const user = allUsers.find(dbUser => dbUser.id === userId);

      if (carQuestionnaire) {
        carChaines.find(ch => {
          if (ch.fieldId === carQuestionnaireField.id) {
            ch.value = carQuestionnaire.content;
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
    const carIds = query['id'] ? new Set<string>((query['id']).split(',')) : new Set<string>();
    delete query['id'];

    const keys = Object.keys(query);

    const needCarFields =
      keys.length > 0
        ? await fieldRepository.find({
            domain: [`${FieldDomains.Car}`],
            name: keys,
          })
        : [];

    needCarFields.forEach(f => {
      if (f.type === FieldType.Dropdown || FieldType.Multiselect) {
        const needVariants = query[f.name].split(',');
        query[f.name] = needVariants.map(v => {
          const index = f.variants.split(',').findIndex(vValue => vValue === v);

          return `${f.name}-${index}`;
        }).join(',')
      }
    })

    const queryValues = keys.map(k => query[k].split(','));
    const rValues = [];
    queryValues.forEach(queryValue => {
      queryValue.forEach(vv => rValues.push(vv));
    })

    const needCarChainesOptions: ExpressionHash<Models.FieldChain> = {
      sourceName: [`${Models.CARS_TABLE_NAME}`],
    }

    if (carIds && carIds.size > 0) {
      needCarChainesOptions.sourceId = [...carIds];
    }

    if (needCarFields.length > 0) {
      needCarChainesOptions.fieldId = needCarFields.map(f => `${f.id}`);
      needCarChainesOptions.value = rValues;
    }

    const needCarChaines = needCarFields.length > 0 ? await fieldChainRepository.find(needCarChainesOptions) : [];

    if (needCarChaines.length > 0) {
      needCarChaines.forEach(ch => {
        carIds.add(`${ch.sourceId}`)
      });
    }

    const cars = carIds.size > 0 ? await carRepository.find({
      id: [...carIds]
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
            sourceName: [Models.CARS_TABLE_NAME],
            sourceId: [`${car.id}`],
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

    const statusField = await fieldRepository.findOne({ name: [`${FieldNames.Car.status}`], domain: [`${FieldDomains.Car}`] });

    const statusFieldRequest: RealField.Request = {
      id: statusField.id,
      name: FieldNames.Car.status,
      value: 'status-0'
    }
    const statusFieldRequestExist = carFields.find(f => f.id === statusFieldRequest.id)

    if (!statusFieldRequestExist || !statusFieldRequestExist.value) {
      carFields.push(statusFieldRequest);
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

    const carQuestionnaireField = carFields.find(f => f.name === FieldNames.Car.carQuestionnaire);

    if (carQuestionnaireField && carQuestionnaireField.value) {
      const carQuestionnaireExist = await carQuestionnaireRepository.findOne({ carId: [`${carId}`]});

      if (carQuestionnaireExist) {
        await carQuestionnaireRepository.updateById(carQuestionnaireExist.id, { content: carQuestionnaireField.value });
      } else {
        await carQuestionnaireRepository.create({ carId, content: carQuestionnaireField.value });
      }
    }

    const fieldsExists = await fieldChainRepository.find({
      sourceName: [Models.CARS_TABLE_NAME],
      sourceId: [`${carId}`],
    });

    const fieldChainForCreate = carFields.filter(f => !fieldsExists.find(fe => fe.fieldId === f.id))

    const cf = carFields.filter(f => f.name !== FieldNames.Car.carQuestionnaire);
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
    const chaines = await fieldChainRepository.find({
      sourceName: [Models.CARS_TABLE_NAME],
      sourceId: ids.map(id => `${id}`),
    });
    await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
    const car = await carRepository.delete({ id: ids.map(id => `${id}`) });
    return car
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
