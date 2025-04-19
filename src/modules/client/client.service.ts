import { Injectable } from '@nestjs/common';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ClientResponse } from './entities/client.entity';
import { PrismaService } from 'src/prisma/prisma.service';
import { FieldsService } from 'src/core/fields/fields.service';
import { FieldDomains } from 'src/core/fields/fields';
import { FieldResponse } from 'src/core/fields/entities/field.entity';
import { Models } from 'src/temp/entities/Models';
import { getFieldsWithValues } from 'src/core/utils/field.utils';
import { StringHash } from 'src/temp/models/hashes';
import { FieldChainService } from 'src/core/fields/services/field-chain.service';
import { Prisma } from '@prisma/client';
import { ServerClient } from 'src/temp/entities/client';
import { FieldNames } from 'src/temp/entities/FieldNames';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService, private fieldsService: FieldsService, private fieldChainService: FieldChainService) {}

  async create(createClientDto: CreateClientDto) {
    const client = await this.prisma.clients.create({
      data: {
        carIds: createClientDto.carIds
      }
    });

    // if (createClientDto.carIds && !Number.isNaN(+createClientDto.carIds) && createClientDto.carIds.split) { // TODO only one car
    //   await carStatisticService.addCall(createClientDto.carIds.split(',').map(id => +id));
    // }

    await Promise.all(createClientDto.fields.map(f => this.fieldChainService.create({
      // data: { // TODO type it
        sourceId: client.id,
        fieldId: f.id,
        value: f.value,
        sourceName: Models.Table.Clients
      // }
    })));

    return client;
  }

  async findAll(): Promise<{
    list: ClientResponse[];
    total: number;
  }> {
    const [
      clients,
      relatedFields
    ] = await Promise.all([
      this.prisma.clients.findMany(),
      this.fieldsService.getFieldsByDomain(FieldDomains.Client)
    ]);

    let list = await this.getClients(clients , relatedFields);

    return {
      list: list,
      total: clients.length
    };
  }

  async findMany(query: StringHash) {
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

    const searchClientsIds = await this.fieldChainService.getEntityIdsByQuery(
      Models.Table.Clients,
      FieldDomains.Client,
      query
    );

    let clientsIds: number[] = [...searchClientsIds];

    if (sortField && sortOrder) {
      const sortFieldConfig = await this.prisma.fields.findFirst({ where: { name:sortField}}); // findUnique?
      if (sortFieldConfig && searchClientsIds.length) {
        const sortChaines = await this.fieldChainService.findMany({
            fieldId: sortFieldConfig.id,
            sourceId: {in:searchClientsIds.map(id =>+id)},
            sourceName: Models.Table.Clients,
        }, sortOrder.toLowerCase() as Prisma.SortOrder);

        clientsIds = sortChaines.map(ch => ch.sourceId);
      }
    }

    if (page && size) {
      const start = (+page - 1) * +size;

      clientsIds = clientsIds.slice(start, start + +size);
    }

    const clientsResults =
      clientsIds.length > 0
        ? await this.prisma.clients.findMany({
            where: {
              id: { in: clientsIds.map((id) => +id) },
            },
          })
        : [];

    const clients = clientsIds.map(id => clientsResults.find(cr => +cr.id === +id));

    const [
      clientsFields,
    ] = await Promise.all([
      this.fieldsService.getFieldsByDomain(FieldDomains.Client),
    ]);

    let list = await this.getClients(clients, clientsFields);;

    return {
      list: list,
      total: searchClientsIds.length
    };
  }


  async getClients(clients: {
    id: number;
    carIds: string;
  }[], clientsFields: FieldResponse[]) {
    const chaines = clients.length > 0 ? await this.fieldChainService.findMany({
        sourceName: Models.Table.Clients,
        sourceId: { in: clients.map(c => c.id) },
    }) : [];

    const result: ClientResponse[] = clients.map(client => ({
      id: client.id,
      carIds: client.carIds,
      fields: getFieldsWithValues(clientsFields, chaines, client.id)
    }));

    return result;
  }

  async findOne(id: number): Promise<ServerClient.Response>  {
    const client = await this.prisma.clients.findUnique({where:{id}});
    const relatedFields = await this.fieldsService.getFieldsByDomain(FieldDomains.Client);
    const chaines = await this.fieldChainService.findMany({
      sourceName: Models.Table.Clients,
      sourceId: id,
    });

    const result: ServerClient.Response = {
      id: client.id,
      carIds: client.carIds,
      fields: getFieldsWithValues(relatedFields, chaines, client.id)
    };

    return result;
  }

  async update(id: number, updateClientDto: UpdateClientDto) {
    const client = await this.prisma.clients.update({ where: {id}, data: {
      carIds: updateClientDto.carIds
    }}, );

    const existsFieldChains = (await Promise.all(updateClientDto.fields.map(f => this.fieldChainService.findMany({
      fieldId:f.id,
      sourceId: id,
      sourceName: Models.Table.Clients
    })))).reduce((prev, cur) => [...prev, ...cur], []);
    const existFieldIds = existsFieldChains.map(ef => +ef.fieldId);

    const existsFields = updateClientDto.fields.filter(f => existFieldIds.includes(+f.id));
    const nonExistFields = updateClientDto.fields.filter(f => !existFieldIds.includes(+f.id));

    existsFields.length > 0 && await Promise.all(existsFields.map(f => this.fieldChainService.update({
      value: f.value
    }, {
      fieldId: f.id,
      sourceId: id,
      sourceName: Models.Table.Clients,
    })));

    nonExistFields.length > 0 && await Promise.all(nonExistFields.map(f => this.fieldChainService.create({
      fieldId: f.id,
      sourceId: id,
      sourceName: Models.Table.Clients,
      value: f.value,
    })));

    return client
  }

  async remove(id: number) {
    await this.fieldChainService.deleteMany({
      sourceName: Models.Table.Clients,
      sourceId: id,
    });

    const client = await this.prisma.clients.delete({where:{id}});
    return client
  }

  async completeDeal(clientId: number, carId: number) {
    const [
      clientFields,
      carFields,
    ] = await Promise.all([
      this.fieldsService.getFieldsByDomain(FieldDomains.Client),
      this.fieldsService.getFieldsByDomain(FieldDomains.Car),
    ]);

    const clientStatusField = clientFields.find(cf => cf.name === FieldNames.Client.dealStatus);
    const carStatusField = carFields.find(cf => cf.name === FieldNames.Car.status);

    const [
      clientStatusChain,
      carStatusChain,
    ] = await Promise.all([
      this.fieldChainService.findOne({
        sourceName: Models.Table.Clients,
        sourceId: clientId,
        fieldId: clientStatusField.id, }
      ),
      this.fieldChainService.findOne({
        sourceName: Models.Table.Cars,
        sourceId: carId,
        fieldId: carStatusField.id, }
      ),
    ]);

    const clientStatusIndex = clientStatusField.variants.split(',').findIndex(v => v === FieldNames.DealStatus.Sold);
    const carStatusIndex = carStatusField.variants.split(',').findIndex(v => v === FieldNames.CarStatus.customerService_Sold);
    const clientStatus = `${FieldNames.Client.dealStatus}-${clientStatusIndex !== -1 ? clientStatusIndex : 0}`;
    const carStatus = `${FieldNames.Car.status}-${carStatusIndex !== -1 ? carStatusIndex : 0}`;

    const res = await Promise.all([
      this.fieldChainService.updateById(clientStatusChain.id, clientStatusChain.fieldId, { value: clientStatus}),
      this.fieldChainService.updateById(carStatusChain.id,  clientStatusChain.fieldId, { value: carStatus}),
    ]);

    // TODO Delete all related carShowings

    return res;
  }
}
