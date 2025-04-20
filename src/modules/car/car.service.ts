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
import { getEntityIdsByNaturalQuery } from 'src/core/utils/enitities-functions';
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

  async findMany(query: StringHash) {
    const { page, size, sortOrder, sortField } = query;
    delete query['page'];
    delete query['size'];
    delete query['sortOrder'];
    delete query['sortField'];

    const naturalFields = ['createdDate', 'ownerId'];
    let naturalQuery = {};

    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (naturalFields.includes(key)) {
          naturalQuery[key] = query[key];
          delete query[key];
        }

        if (key.indexOf('filter-operator-') === 0) {
          if (naturalFields.includes(key.split('-')[2])) {
            naturalQuery[key] = query[key];
            delete query[key];
          }
        }
      }
    }

    const ownerFields = [FieldNames.CarOwner.name] as string[];
    let ownerQuery = {};

    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (ownerFields.includes(key)) {
          ownerQuery[key] = query[key];
          delete query[key];
        }

        if (key.indexOf('filter-operator-') === 0) {
          if (ownerFields.includes(key.split('-')[2])) {
            ownerQuery[key] = query[key];
            delete query[key];
          }
        }
      }
    }

    const ownerNaturalFields = ['number'] as string[];
    let ownerNaturalQuery = {};

    for (const key in query) {
      if (Object.prototype.hasOwnProperty.call(query, key)) {
        if (ownerNaturalFields.includes(key)) {
          ownerNaturalQuery[key] = query[key];
          delete query[key];
        }

        if (key.indexOf('filter-operator-') === 0) {
          if (ownerNaturalFields.includes(key.split('-')[2])) {
            ownerNaturalQuery[key] = query[key];
            delete query[key];
          }
        }
      }
    }

    let searchCarIds: number[] = Object.values(query).length
      ? await this.fieldChainService.getEntityIdsByQuery(
          Models.Table.Cars,
          FieldDomains.Car,
          query,
        )
      : [];

    const ownerSearchCarIds = Object.values(ownerQuery).length
      ? await this.fieldChainService.getEntityIdsByQuery(
          Models.Table.CarOwners,
          FieldDomains.CarOwner,
          ownerQuery,
        )
      : [];

    if (Object.values(ownerQuery).length) {
      searchCarIds = searchCarIds.filter((id) =>
        ownerSearchCarIds.includes(id),
      );
    }

    const naturalsearchCarIds =
      Object.values(naturalQuery).length ||
      (sortField && naturalFields.includes(sortField))
        ? await getEntityIdsByNaturalQuery(
            this.prisma.cars,
            sortField && naturalFields.includes(sortField)
              ? { ...naturalQuery, sortOrder, sortField }
              : naturalQuery,
          )
        : [];

    const naturalsearchOwnerCarIds = Object.values(ownerNaturalQuery).length
      ? await getEntityIdsByNaturalQuery(
          this.prisma.carOwners,
          ownerNaturalQuery,
        )
      : [];

    let carsIds = [...searchCarIds];

    if (
      (Object.values(query).length || Object.values(ownerQuery).length) &&
      (Object.values(naturalQuery).length ||
        (sortField && naturalFields.includes(sortField)))
    ) {
      carsIds = searchCarIds.filter((id) => naturalsearchCarIds.includes(id));
    } else if (
      !(Object.values(query).length || Object.values(ownerQuery).length) &&
      (Object.values(naturalQuery).length ||
        (sortField && naturalFields.includes(sortField)))
    ) {
      carsIds = [...naturalsearchCarIds];
    }

    if (Object.values(ownerNaturalQuery).length) {
      const carsByNaturalOwners = await this.prisma.cars.findMany({
        where: {
          ownerId: {
            in: naturalsearchOwnerCarIds,
          },
        },
      });
      const carsIdsByNaturalOwners = carsByNaturalOwners.map((car) => car.id);

      carsIds = carsIds.filter((id) => carsIdsByNaturalOwners.includes(id));
    }

    if (sortField && sortOrder) {
      if (sortField.indexOf('/') > 0) {
        const [firstSortField, secondSortField] = sortField.split('/');
        const firstSortFieldConfig = await this.prisma.fields.findFirst({
          where: {
            domain: FieldDomains.Car,
            name: firstSortField,
          },
        });
        const secondSortFieldConfig = await this.prisma.fields.findFirst({
          where: {
            domain: FieldDomains.Car,
            name: secondSortField,
          },
        });

        const firstWhere: Prisma.fieldIdsWhereInput = {
          fieldId: firstSortFieldConfig.id,
          sourceName: Models.Table.Cars,
        };

        const secondWhere: Prisma.fieldIdsWhereInput = {
          fieldId: secondSortFieldConfig.id,
          sourceName: Models.Table.Cars,
        };

        if (carsIds.length) {
          firstWhere.sourceId = { in: carsIds };
          secondWhere.sourceId = { in: carsIds };
        }

        const firstSortChaines = await this.prisma.fieldIds.findMany({
          where: firstWhere,
          orderBy: {
            value: sortOrder as Prisma.SortOrder,
          },
        });

        const secondSortChaines = await this.prisma.fieldIds.findMany({
          where: secondWhere,
          orderBy: {
            value: sortOrder as Prisma.SortOrder,
          },
        });
        const secondSortIds = secondSortChaines.map((ch) => ch.sourceId);

        const groupsByFirst = firstSortChaines.reduce<{
          id: number;
          sourceId: number;
          fieldId: number;
          value: string | null;
          sourceName: string | null;
        }[][]>((prev, cur) => {
          let curGroup = prev[prev.length - 1];

          if (!curGroup.length) {
            return [[cur]];
          }

          if (curGroup[0].value.trim() !== cur.value.trim()) {
            return [...prev, [cur]];
          } else {
            prev[prev.length - 1].push(cur);
            return prev;
          }
        }, [[]]);

        carsIds = [];
        groupsByFirst.forEach(groupByFirst => {
          const groupByFirstIds = groupByFirst.map(g => g.sourceId);

          const groupBySecond = secondSortIds.filter(s => groupByFirstIds.includes(s));
          carsIds.push(...groupBySecond);
        });
      } else {
        const sortFieldConfig = !naturalFields.includes(sortField) ? await this.prisma.fields.findFirst({
          where: {
            domain: FieldDomains.Car,
            name: sortField,
          },
        }) : null;

        if (sortFieldConfig) {
          const where: Prisma.fieldIdsWhereInput = {
            fieldId: sortFieldConfig.id,
            sourceName: Models.Table.Cars,
          };

          if (carsIds.length) {
            where.sourceId = { in: carsIds };
          }

          const sortChaines = await this.prisma.fieldIds.findMany({
            where: where,
            orderBy: {
              value: sortOrder as Prisma.SortOrder,
            },
          });

          carsIds = sortChaines.map((ch) => ch.sourceId);
        } else if (naturalFields.includes(sortField)) {
          const sortedCarIds = await this.prisma.cars.findMany({
            where: {
              id: {
                in: carsIds
              }
            },
            orderBy: {
              [sortField]: sortOrder
            }
          });

          carsIds = sortedCarIds.map(car => car.id);
        }
      }
    }

    let total = carsIds.length;

    if (page && size) {
      const start = (+page - 1) * +size;

      carsIds = carsIds.slice(start, start + +size);
    }

    const carsResult =
      carsIds.length > 0
        ? await this.prisma.cars.findMany({
            where: {
              id: { in: carsIds.map((id) => +id) },
            },
          })
        : [];

    const cars = carsIds.map((id) => carsResult.find((cr) => +cr.id === +id)).filter(Boolean);

    if (!cars.length) { // TODO test
      return {
        list: [],
        total: 0,
      };
    }

    const [carFields, carOwners, carOwnerFields] = await Promise.all([
      this.fieldsService.getFieldsByDomain(FieldDomains.Car),
      cars.length > 0
        ? await this.prisma.carOwners.findMany({
            where: {
              id: { in: cars.map((c) => c.ownerId) },
            },
          })
        : [],
      this.fieldsService.getFieldsByDomain(FieldDomains.CarOwner),
    ]);

    let list = await this.getCars(cars, carFields, carOwners, carOwnerFields);

    return {
      list: list,
      total: total,
    };
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
