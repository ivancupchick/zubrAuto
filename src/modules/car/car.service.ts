import { Injectable } from '@nestjs/common';
import { CreateCarDto } from './dto/create-car.dto';
import { UpdateCarDto } from './dto/update-car.dto';
import { StringHash } from 'src/temp/models/hashes';
import { Models } from 'src/temp/entities/Models';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldsService } from 'src/core/fields/fields.service';
import { FieldChainService } from 'src/core/fields/services/field-chain.service';
import { RealField, ServerField } from 'src/temp/entities/Field';
import { FieldNames } from 'src/temp/entities/FieldNames';
import { UserService } from '../user/user.service';
import { ServerCar } from 'src/temp/entities/Car';
import { FieldsUtils, getFieldsWithValues } from 'src/core/utils/field.utils';
import { FieldDomains } from 'src/core/fields/fields';
import { CarInfoGetterService } from './services/car-info-getter.service';
import {
  BaseQuery,
  getEntityIdsByNaturalQuery,
} from 'src/core/utils/enitities-functions';
import { Prisma } from '@prisma/client';

@Injectable()
export class CarService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
    private fieldsService: FieldsService,
    private fieldChainService: FieldChainService,
    private carInfoGetterService: CarInfoGetterService,
  ) {}

  private async getCars(
    cars: Models.Car[],
    carFields: ServerField.Response[],
    carOwners: Models.CarOwner[],
    carOwnerFields: ServerField.Response[],
  ) {
    // const start = new Date().getTime();

    if (cars.length === 0) {
      return [];
    }

    const [allCarChaines, allCarOwnerChaines, carForms] = await Promise.all([
      cars.length > 0
        ? await this.fieldChainService.findMany({
            sourceName: Models.Table.Cars,
            sourceId: { in: cars.map((c) => c.id) },
          })
        : [],
      carOwners.length > 0
        ? await this.fieldChainService.findMany({
            sourceName: Models.Table.CarOwners,
            sourceId: { in: carOwners.map((c) => c.id) },
          })
        : [],

      cars.length > 0
        ? await this.prisma.carForms.findMany({
            where: {
              carId: { in: cars.map((c) => c.id) },
            },
          })
        : [],
    ]);

    const contactCenterSpecialistIdField = carFields.find(
      (f) => f.name === FieldNames.Car.contactCenterSpecialistId,
    );
    const workSheetField = carFields.find(
      (f) => f.name === FieldNames.Car.worksheet,
    );
    const contactCenterSpecialistField = carFields.find(
      (f) => f.name === FieldNames.Car.contactCenterSpecialist,
    );

    if (
      !contactCenterSpecialistIdField ||
      !workSheetField ||
      !contactCenterSpecialistField
    ) {
      throw new Error(
        '!contactCenterSpecialistIdField || !workSheetField || !contactCenterSpecialistField',
      );
    }

    const allUsers = await this.userService.findAll();
    // const contactCenterSpecialistIdChaines = allCarChaines.filter(ch => ch.fieldId === contactCenterSpecialistIdField.id)
    // const contactCenterSpecialistChaines = allCarChaines.filter(ch => ch.fieldId === contactCenterSpecialistField.id)
    // const workSheetChaines = allCarChaines.filter(ch => ch.fieldId === workSheetField.id)

    const result: ServerCar.Response[] = cars.map((car) => {
      const carChaines = allCarChaines.filter((ch) => ch.sourceId === car.id);
      const carOwnerChaines = allCarOwnerChaines.filter(
        (ch) => ch.sourceId === car.ownerId,
      );

      const carForm = carForms.find((form) => form.carId === car.id);

      const userIdValue = carChaines.find(
        (ch) => ch.fieldId === contactCenterSpecialistIdField.id,
      );
      const userId: number =
        userIdValue && userIdValue.value ? +userIdValue.value : -1;
      const user = allUsers.list.find((dbUser) => dbUser.id === userId);

      if (carForm) {
        carChaines.find((ch) => {
          if (ch.fieldId === workSheetField.id) {
            ch.value = carForm.content;
            return true;
          }

          return false;
        });
      }

      if (user) {
        const r = carChaines.find((ch) => {
          if (ch.fieldId === contactCenterSpecialistField.id) {
            ch.value = JSON.stringify(user);
            return true;
          }

          return false;
        });

        if (!r) {
          carChaines.push({
            id: -1,
            sourceId: car.id,
            fieldId: contactCenterSpecialistField.id,
            value: JSON.stringify(user),
            sourceName: `${Models.Table.Cars}`,
          });
        }
      }

      return {
        id: car.id,
        createdDate: car.createdDate,
        ownerId: car.ownerId,
        ownerNumber:
          carOwners.find((co) => co.id === car.ownerId)?.number || '',
        fields: [
          ...getFieldsWithValues(carFields, carChaines, car.id),
          ...getFieldsWithValues(carOwnerFields, carOwnerChaines, car.ownerId),
        ],
      };
    });

    // const end = new Date().getTime();
    // console.log(`cars getCars...: ${end - start}ms`);

    return result;
  }

  async findOne(id: number) {
    const [car, carFields, carOwnerFields] = await Promise.all([
      this.prisma.cars.findUnique({ where: { id } }),
      this.fieldsService.getFieldsByDomain(FieldDomains.Car),
      this.fieldsService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    const carOwner = await this.prisma.carOwners.findUnique({
      where: { id: car.ownerId },
    });

    const result = await this.getCars(
      [car],
      carFields,
      [carOwner],
      carOwnerFields,
    );

    return result[0];
  }

  async findAll() {
    const [cars, carFields, carOwners, carOwnerFields] = await Promise.all([
      this.prisma.cars.findMany(),
      this.fieldsService.getFieldsByDomain(FieldDomains.Car),
      this.prisma.carOwners.findMany(),
      this.fieldsService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    return this.getCars(cars, carFields, carOwners, carOwnerFields);
  }

  async findMany(query: BaseQuery & StringHash) {
    const methodStart = performance.now();
    const logTime = () => `${(performance.now() - methodStart).toFixed(0)}ms`;
    const { page, size, sortOrder, sortField, ...filterParams } = query;

    const DIRECT_FIELDS = ['createdDate', 'ownerId', 'id'];
    const OWNER_FIELDS = [FieldNames.CarOwner.name];
    const OWNER_DIRECT_FIELDS = ['number'];

    const extractQuery = (fields, source) => {
      return Object.keys(source).reduce((prev, key) => {
        if (fields.includes(key)) {
          prev[key] = source[key];
          delete source[key];
        } else if (key.startsWith('filter-operator-')) {
          const field = key.split('-')[2];
          if (fields.includes(field)) {
            prev[key] = source[key];
            delete source[key];
          }
        }
        return prev;
      }, {});
    };

    const directQuery = extractQuery(DIRECT_FIELDS, filterParams);
    const ownerQuery = extractQuery(OWNER_FIELDS, filterParams);
    const ownerDirectQuery = extractQuery(OWNER_DIRECT_FIELDS, filterParams);

    const [customIds, ownerIds, directIds, ownerDirectIds]: number[][] =
      await Promise.all([
        this.fieldChainService.getEntityIdsByQuery(
          Models.Table.Cars,
          FieldDomains.Car,
          filterParams,
          sortOrder,
        ),
        this.fieldChainService
          .getEntityIdsByQuery(
            Models.Table.CarOwners,
            FieldDomains.CarOwner,
            ownerQuery,
          )
          .then((ids) => {
            if (!ids.length) {
              return [];
            }

            return this.prisma.cars
              .findMany({
                where: { ownerId: { in: ids } },
                select: { id: true },
                orderBy: {
                  id: sortOrder || 'asc',
                },
              })
              .then((ids) => ids.map((c) => c.id));
          }),
        getEntityIdsByNaturalQuery(this.prisma.cars, directQuery, sortOrder),
        getEntityIdsByNaturalQuery(
          this.prisma.carOwners,
          ownerDirectQuery,
        ).then((ids) => {
          if (!ids.length) {
            return [];
          }

          return this.prisma.cars
            .findMany({
              where: { ownerId: { in: ids } },
              select: { id: true },
              orderBy: {
                id: sortOrder || 'asc',
              },
            })
            .then((ids) => ids.map((c) => c.id));
        }),
      ]);

    let resultIds =
      (customIds.length && customIds) ||
      (ownerIds.length && ownerIds) ||
      (directIds.length && directIds) ||
      (ownerDirectIds.length && ownerDirectIds);
    if (ownerIds.length && customIds.length)
      resultIds = resultIds.filter((id) => ownerIds.includes(id));
    if (directIds.length && (customIds.length || ownerIds.length))
      resultIds = resultIds.filter((id) => directIds.includes(id));
    if (
      ownerDirectIds.length &&
      (customIds.length || ownerIds.length || directIds.length)
    ) {
      resultIds = resultIds.filter((id) => ownerDirectIds.includes(id));
    }

    if (sortField && sortField !== 'id') {
      if (sortField.includes('/')) {
        const sortMultiplier = sortOrder === 'desc' ? -1 : 1;
        const [field1, field2] = sortField.split('/');
        const [config1, config2] = await Promise.all([
          this.prisma.fields.findFirst({
            where: { domain: FieldDomains.Car, name: field1 },
            select: { id: true },
          }),
          this.prisma.fields.findFirst({
            where: { domain: FieldDomains.Car, name: field2 },
            select: { id: true },
          }),
        ]);

        const where = {
          sourceName: Models.Table.Cars,
          ...(resultIds.length && { sourceId: { in: resultIds } }),
        };

        const [data1, data2] = await Promise.all([
          this.prisma.fieldIds.findMany({
            where: { ...where, fieldId: config1.id },
            orderBy: { value: sortOrder },
            select: { sourceId: true, value: true },
          }),
          this.prisma.fieldIds.findMany({
            where: { ...where, fieldId: config2.id },
            orderBy: { value: sortOrder },
            select: { sourceId: true, value: true },
          }),
        ]);

        const valueMap1 = data1.reduce((acc, d) => {
          acc[d.sourceId] = d.value?.trim() ?? '';
          return acc;
        }, {});

        const valueMap2 = data2.reduce((acc, d) => {
          acc[d.sourceId] = d.value?.trim() ?? '';
          return acc;
        }, {});

        resultIds = [
          ...new Set([
            ...data1.map((d) => d.sourceId),
            ...data2.map((d) => d.sourceId),
          ]),
        ].sort((a, b) => {
          const comp =
            (valueMap1[a] ?? '').localeCompare(valueMap1[b] ?? '') *
            sortMultiplier;
          return comp !== 0
            ? comp
            : (valueMap2[a] ?? '').localeCompare(valueMap2[b] ?? '') *
                sortMultiplier;
        });
      } else if (DIRECT_FIELDS.includes(sortField)) {
        console.log('deprecated sort');
        resultIds = (
          await this.prisma.cars.findMany({
            where: {
              ...(resultIds.length && { id: { in: resultIds } }),
            },
            orderBy: { [sortField]: sortOrder },
            select: { id: true },
          })
        ).map((c) => c.id);
      } else {
        const sortFieldConfig = await this.prisma.fields.findFirst({
          where: { domain: FieldDomains.Car, name: sortField },
          select: { id: true },
        });
        if (sortFieldConfig) {
          resultIds = (
            await this.prisma.fieldIds.findMany({
              where: {
                fieldId: sortFieldConfig.id,
                sourceName: Models.Table.Cars,
                ...(resultIds.length && { sourceId: { in: resultIds } }),
              },
              orderBy: { value: sortOrder },
              select: { sourceId: true },
            })
          ).map((s) => s.sourceId);
        }
      }
    }

    const total = resultIds.length;
    const paginatedCarsIds =
      page && size
        ? resultIds.slice((+page - 1) * +size, +page * +size)
        : resultIds;

    const [cars, fields, ownerFields] = await Promise.all([
      paginatedCarsIds.length
        ? this.prisma.cars.findMany({ where: { id: { in: paginatedCarsIds } } })
        : ([] as Models.Car[]),
      this.fieldsService.getFieldsByDomain(FieldDomains.Car),
      this.fieldsService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    const carsById = cars.reduce((acc, car) => {
      acc[car.id] = car;
      return acc;
    }, {});

    const paginatedCars = paginatedCarsIds.map((id) => carsById[id]).filter(Boolean);

    if (!paginatedCars.length) {
      return { list: [], total: 0 };
    }

    const owners = await this.prisma.carOwners.findMany({
      where: { id: { in: paginatedCars.map((c) => c.ownerId) } },
    });

    const list = await this.getCars(paginatedCars, fields, owners, ownerFields);

    console.log(logTime());
    return { list: list, total };
  }

  private async getCarAndOwnerCarFields(
    carData: RealField.With.Request,
  ): Promise<[RealField.Request[], RealField.Request[]]> {
    const carOwnerFieldsConfigs = await this.fieldsService.getFieldsByDomain(
      FieldDomains.CarOwner,
    );

    const ownerFields = carData.fields.filter(
      (f) => !!carOwnerFieldsConfigs.find((fc) => fc.id === f.id),
    );
    const carFields = carData.fields.filter(
      (f) => !carOwnerFieldsConfigs.find((of) => of.id === f.id),
    );

    return [ownerFields, carFields];
  }

  async createCarInDB(createCarDto: CreateCarDto) {
    const [ownerFields, carFields] =
      await this.getCarAndOwnerCarFields(createCarDto);

    const existCarOwner = false; // await this.prisma.carOwners.findOne({ number: [`${carData.ownerNumber}`]});

    const ownerId = (
      await this.prisma.carOwners.create({
        data: { number: createCarDto.ownerNumber },
      })
    ).id;
    //  !existCarOwner
    //   ? (await this.prisma.carOwners.create({ number: carData.ownerNumber })).id
    //   : existCarOwner.id;

    // const existCarIds = await this.prisma.cars.find({ ownerId: [`${existCarOwner?.id || -1}` ]});

    // const searchFields = await this.prisma.fields.findMany({where: { name: FieldNames.Car.linkToAd}});
    // const existCarChain = await this.fieldChainService.findMany({
    //   sourceName: Models.Table.Cars,
    //   fieldId: {in: searchFields.map(f => f.id)},
    //   value: FieldsUtils.getFieldValue(createCarDto, FieldNames.Car.linkToAd)
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
      await Promise.all(
        ownerFields.map((f) =>
          this.fieldChainService.create({
            sourceId: ownerId,
            fieldId: f.id,
            value: f.value,
            sourceName: Models.Table.CarOwners,
          }),
        ),
      );
    } else {
      // await this.prisma.carOwners.updateById(existCarOwner.id, { // not need
      //   id: 0,
      //   number: carData.ownerNumber
      // })
      await Promise.all(
        ownerFields.map((f) =>
          this.fieldChainService.update(
            {
              value: f.value,
            },
            {
              fieldId: f.id,
              sourceId: ownerId,
              sourceName: Models.Table.CarOwners,
            },
          ),
        ),
      );
    }

    const statusField = await this.prisma.fields.findFirst({
      where: { name: FieldNames.Car.status, domain: FieldDomains.Car },
    });

    if (statusField) {
      const statusFieldRequest: RealField.Request = {
        id: statusField.id,
        name: FieldNames.Car.status,
        value: 'status-0',
      };
      const statusFieldRequestExist = carFields.find(
        (f) => f.id === statusFieldRequest.id,
      );

      if (!statusFieldRequestExist || !statusFieldRequestExist.value) {
        carFields.push(statusFieldRequest);
      }
    }

    const car = await this.prisma.cars.create({
      data: {
        createdDate: `${new Date().getTime()}`,
        ownerId,
      },
    });
    await Promise.all(
      carFields.map((f) =>
        this.fieldChainService.create({
          sourceId: car.id,
          fieldId: f.id,
          value: f.value,
          sourceName: Models.Table.Cars,
        }),
      ),
    );

    return { id: car.id };
  }

  async create(createCarDto: CreateCarDto) {
    const [ownerFields, carFields] =
      await this.getCarAndOwnerCarFields(createCarDto);

    const existCarOwner = false; // await this.prisma.carOwners.findOne({ number: [`${carData.ownerNumber}`]});

    const ownerId = (
      await this.prisma.carOwners.create({
        data: { number: createCarDto.ownerNumber },
      })
    ).id;
    //  !existCarOwner
    //   ? (await this.prisma.carOwners.create({ number: carData.ownerNumber })).id
    //   : existCarOwner.id;

    // const existCarIds = await this.prisma.cars.find({ ownerId: [`${existCarOwner?.id || -1}` ]});

    const searchFields = await this.prisma.fields.findMany({
      where: { name: FieldNames.Car.linkToAd },
    });
    const existCarChain = await this.fieldChainService.findMany({
      sourceName: Models.Table.Cars,
      fieldId: { in: searchFields.map((f) => f.id) },
      value: FieldsUtils.getFieldValue(createCarDto, FieldNames.Car.linkToAd),
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
      await Promise.all(
        ownerFields.map((f) =>
          this.fieldChainService.create({
            sourceId: ownerId,
            fieldId: f.id,
            value: f.value,
            sourceName: Models.Table.CarOwners,
          }),
        ),
      );
    } else {
      // await this.prisma.carOwners.updateById(existCarOwner.id, { // not need
      //   id: 0,
      //   number: carData.ownerNumber
      // })
      await Promise.all(
        ownerFields.map((f) =>
          this.fieldChainService.update(
            {
              value: f.value,
            },
            {
              fieldId: f.id,
              sourceId: ownerId,
              sourceName: Models.Table.CarOwners,
            },
          ),
        ),
      );
    }

    const statusField = await this.prisma.fields.findFirst({
      where: { name: FieldNames.Car.status, domain: FieldDomains.Car },
    });

    if (statusField) {
      const statusFieldRequest: RealField.Request = {
        id: statusField.id,
        name: FieldNames.Car.status,
        value: 'status-0',
      };
      const statusFieldRequestExist = carFields.find(
        (f) => f.id === statusFieldRequest.id,
      );

      if (!statusFieldRequestExist || !statusFieldRequestExist.value) {
        carFields.push(statusFieldRequest);
      }
    }

    const car = await this.prisma.cars.create({
      data: {
        createdDate: `${new Date().getTime()}`,
        ownerId,
      },
    });
    await Promise.all(
      carFields.map((f) =>
        this.fieldChainService.create({
          sourceId: car.id,
          fieldId: f.id,
          value: f.value,
          sourceName: Models.Table.Cars,
        }),
      ),
    );

    return { id: car.id };
  }

  async update(carId: number, updateCarDto: UpdateCarDto) {
    const [ownerFields, carFields] =
      await this.getCarAndOwnerCarFields(updateCarDto);
    let needUpdate = false;

    const existCar = await this.prisma.cars.findUnique({
      where: { id: carId },
    });
    const existCarOwnerById = await this.prisma.carOwners.findUnique({
      where: { id: existCar.ownerId },
    });
    const existCarOwnerByNumber = updateCarDto.ownerNumber
      ? await this.prisma.carOwners.findFirst({
          where: { number: updateCarDto.ownerNumber },
        })
      : null;

    let carOwner = existCarOwnerById;

    if (!existCarOwnerByNumber && updateCarDto.ownerNumber) {
      carOwner = await this.prisma.carOwners.update({
        where: { id: existCar.ownerId },
        data: { number: updateCarDto.ownerNumber },
      });
      // } else if (existCarOwnerById.number === existCarOwnerByNumber.number) {
    } else if (
      existCarOwnerById &&
      existCarOwnerByNumber &&
      existCarOwnerByNumber.number !== existCarOwnerById.number
    ) {
      updateCarDto = Object.assign({}, updateCarDto, {
        ownerId: existCarOwnerByNumber.id,
      });
      carOwner = existCarOwnerByNumber;
      needUpdate = true;
    }

    await Promise.all(
      ownerFields.map((f) =>
        this.fieldChainService.update(
          {
            value: f.value,
          },
          {
            fieldId: f.id,
            sourceId: carOwner.id,
            sourceName: Models.Table.CarOwners,
          },
        ),
      ),
    );

    if (needUpdate) {
      await this.prisma.cars.update({
        where: { id: carId },
        data: { ownerId: carOwner.id },
      });
    }

    const worksheetField = carFields.find(
      (f) => f.name === FieldNames.Car.worksheet,
    );

    if (worksheetField && worksheetField.value) {
      const carFormExist = await this.prisma.carForms.findFirst({
        where: { carId: carId },
      });

      if (carFormExist) {
        await this.prisma.carForms.update({
          where: { id: carFormExist.id },
          data: { content: worksheetField.value },
        });
      } else {
        await this.prisma.carForms.create({
          data: { carId, content: worksheetField.value },
        });
      }
    }

    const fieldsExists = await this.fieldChainService.findMany({
      sourceName: Models.Table.Cars,
      sourceId: carId,
    });

    const fieldChainForCreate = carFields.filter(
      (f) => !fieldsExists.find((fe) => fe.fieldId === f.id),
    );

    const cf = carFields.filter((f) => f.name !== FieldNames.Car.worksheet);
    await Promise.all(
      cf.map((f) =>
        this.fieldChainService.update(
          {
            value: f.value,
          },
          {
            fieldId: f.id,
            sourceId: carId,
            sourceName: Models.Table.Cars,
          },
        ),
      ),
    );

    if (fieldChainForCreate.length > 0) {
      await Promise.all(
        fieldChainForCreate.map((f) =>
          this.fieldChainService.create({
            sourceId: carId,
            fieldId: f.id,
            value: f.value,
            sourceName: Models.Table.Cars,
          }),
        ),
      );
    }

    return { id: carId };
  }

  async remove(id: number) {
    await this.fieldChainService.deleteMany({
      sourceName: Models.Table.Cars,
      sourceId: id,
    });

    const car = await this.prisma.cars.delete({ where: { id } });
    return car;
  }

  async removeMany(ids: string[]) {
    // const chaines = await fieldChainRepository.find({
    //   sourceName: [Models.Table.Cars],
    //   sourceId: ids.map(id => `${id}`),
    // });
    await this.fieldChainService.deleteMany({
      sourceName: Models.Table.Cars,
      sourceId: { in: ids.map((id) => +id) },
    });
    // await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
    const cars = await this.prisma.cars.deleteMany({
      where: { id: { in: ids.map((id) => +id) } },
    });
    return cars;
  }

  async createCarsByLink(
    data: ServerCar.CreateByLink,
  ): Promise<(ServerCar.Response | ServerCar.IdResponse)[]> {
    const [carFields, carOwnerFields] = await Promise.all([
      this.fieldsService.getFieldsByDomain(FieldDomains.Car),
      this.fieldsService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    const queries = data.link.split('?')[1];

    const createCarData = await this.carInfoGetterService.getCarsInfo(
      queries,
      carFields,
      carOwnerFields,
      data.userId,
    );

    if (createCarData.length === 0) {
      return [];
    }

    const createdCarIds = await Promise.all(
      createCarData.map((cc) => this.createCarInDB(cc)),
    );

    const result = createdCarIds.map((r, i) => {
      if (r.id === -1) {
        const carData = createCarData[i];

        return { ...carData, id: -1 }; // TODO! Maybe rethink minor errors for all apies...
      }

      return { ...r };
    });

    return result;
  }

  async createCarsByManager(
    data: ServerCar.CreateByManager,
  ): Promise<(ServerCar.Response | ServerCar.IdResponse)[]> {
    const [carFields, carOwnerFields] = await Promise.all([
      this.fieldsService.getFieldsByDomain(FieldDomains.Car),
      this.fieldsService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    const createCarData =
      await this.carInfoGetterService.getCarsInfoByManualInfo(
        data.cars,
        carFields,
        carOwnerFields,
        data.specialist,
      );

    if (createCarData.length === 0) {
      return [];
    }

    const createdCarIds = await Promise.all(
      createCarData.map((cc) => this.createCarInDB(cc)),
    );

    const result = createdCarIds.map((r, i) => {
      if (r.id === -1) {
        const carData = createCarData[i];

        return { ...carData, id: -1 }; // TODO! Maybe rethink minor errors for all apies...
      }

      return { ...r };
    });

    return result;
  }
}
