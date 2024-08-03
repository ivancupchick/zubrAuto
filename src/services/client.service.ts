import { ServerClient } from "../entities/Client";
import { FieldDomains, ServerField } from "../entities/Field";
import { FieldNames } from "../entities/FieldNames";
import { Models } from "../entities/Models";
import { ICrudService } from "../entities/Types";
import { StringHash } from "../models/hashes";
import clientRepository from "../repositories/base/client.repository";
import fieldRepository from "../repositories/base/field.repository";
import { getFieldsWithValues } from "../utils/field.utils";
import fieldChainService from "./field-chain.service";
import fieldService from "./field.service";

class ClientService implements ICrudService<ServerClient.CreateRequest, ServerClient.UpdateRequest, ServerClient.Response, ServerClient.IdResponse> {
  async getAll(): Promise<{
    list: ServerClient.Response[];
    total: number;
  }> {
    const [
      clients,
      relatedFields
    ] = await Promise.all([
      clientRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.Client)
    ]);

    let list = await this.getClients(clients , relatedFields);

    return {
      list: list,
      total: clients.length
    };
  }

  async getClients(clients: Models.Client[], clientsFields: ServerField.Response[]) {
    const chaines = clients.length > 0 ? await fieldChainService.find({
      sourceName: [`${Models.Table.Clients}`],
      sourceId: clients.map(c => `${c.id}`),
    }) : [];

    const result: ServerClient.Response[] = clients.map(client => ({
      id: client.id,
      carIds: client.carIds,
      fields: getFieldsWithValues(clientsFields, chaines, client.id)
    }))

    return result;
  }

  async getClientsByQuery(query: StringHash) {
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

    const searchClientsIds = await fieldChainService.getEntityIdsByQuery(
      Models.Table.Clients,
      FieldDomains.Client,
      query
    );

    let clientsIds = [...searchClientsIds];

    if (sortField && sortOrder) {
      const sortFieldConfig = await fieldRepository.findOne({
        name: [sortField]
      });

      if (sortFieldConfig && searchClientsIds.length) {
        const sortChaines = await fieldChainService.find({
          fieldId: [`${sortFieldConfig.id}`],
          sourceId: searchClientsIds,
          sourceName: [Models.Table.Clients],
        }, sortOrder);

        clientsIds = sortChaines.map(ch => `${ch.sourceId}`);
      }
    }

    if (page && size) {
      const start = (+page - 1) * +size;

      clientsIds = clientsIds.slice(start, start + +size);
    }

    const clients = clientsIds.length > 0 ? await clientRepository.find({
      id: clientsIds
    }) : [];

    const [
      clientsFields,
    ] = await Promise.all([
      fieldService.getFieldsByDomain(FieldDomains.Client),
    ]);

    let list = await this.getClients(clients, clientsFields);;

    // if (sortOrder === 'DESC') {
    //   list = list.reverse();
    // }

    return {
      list: list,
      total: searchClientsIds.length
    };
  }

  async create(clientData: ServerClient.CreateRequest) {
    const client = await clientRepository.create({
      carIds: clientData.carIds
    });

    // if (clientData.carIds && !Number.isNaN(+clientData.carIds) && clientData.carIds.split) { // TODO only one car
    //   await carStatisticService.addCall(clientData.carIds.split(',').map(id => +id));
    // }

    await Promise.all(clientData.fields.map(f => fieldChainService.create({
      sourceId: client.id,
      fieldId: f.id,
      value: f.value,
      sourceName: Models.Table.Clients
    })));

    return client;
  }

  async update(id: number, clientData: ServerClient.CreateRequest) {
    const client = await clientRepository.updateById(id, {
      carIds: clientData.carIds
    });

    const existsFieldChains = (await Promise.all(clientData.fields.map(f => fieldChainService.find({
      fieldId: [f.id].map(c => `${c}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.Table.Clients]
    })))).reduce((prev, cur) => [...prev, ...cur], []);
    const existFieldIds = existsFieldChains.map(ef => +ef.fieldId);

    const existsFields = clientData.fields.filter(f => existFieldIds.includes(+f.id));
    const nonExistFields = clientData.fields.filter(f => !existFieldIds.includes(+f.id));

    existsFields.length > 0 && await Promise.all(existsFields.map(f => fieldChainService.update({
      value: f.value
    }, {
      fieldId: [f.id].map(c => `${c}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.Table.Clients]
    })));

    nonExistFields.length > 0 && await Promise.all(nonExistFields.map(f => fieldChainService.create({
      fieldId: f.id,
      sourceId: id,
      sourceName: Models.Table.Clients,
      value: f.value,
    })));

    return client
  }

  async delete(id: number) {
    await fieldChainService.delete({
      sourceName: [Models.Table.Clients],
      sourceId: [`${id}`],
    });

    const client = await clientRepository.deleteById(id);
    return client
  }

  async get(id: number): Promise<ServerClient.Response> {
    const client = await clientRepository.findById(id);
    const relatedFields = await fieldService.getFieldsByDomain(FieldDomains.Client);
    const chaines = await fieldChainService.find({
      sourceName: [`${Models.Table.Clients}`],
      sourceId: [`${id}`],
    });

    const result: ServerClient.Response = {
      id: client.id,
      carIds: client.carIds,
      fields: getFieldsWithValues(relatedFields, chaines, client.id)
    };

    return result;
  }

  async completeDeal(clientId: number, carId: number) {
    const [
      clientFields,
      carFields,
    ] = await Promise.all([
      fieldService.getFieldsByDomain(FieldDomains.Client),
      fieldService.getFieldsByDomain(FieldDomains.Car),
    ]);

    const clientStatusField = clientFields.find(cf => cf.name === FieldNames.Client.dealStatus);
    const carStatusField = carFields.find(cf => cf.name === FieldNames.Car.status);

    const [
      clientStatusChain,
      carStatusChain,
    ] = await Promise.all([
      fieldChainService.findOne({
        sourceName: [`${Models.Table.Clients}`],
        sourceId: [`${clientId}`],
        fieldId: [`${clientStatusField.id}`], }
      ),
      fieldChainService.findOne({
        sourceName: [`${Models.Table.Cars}`],
        sourceId: [`${carId}`],
        fieldId: [`${carStatusField.id}`], }
      ),
    ]);

    const clientStatusIndex = clientStatusField.variants.split(',').findIndex(v => v === FieldNames.DealStatus.Sold);
    const carStatusIndex = carStatusField.variants.split(',').findIndex(v => v === FieldNames.CarStatus.customerService_Sold);
    const clientStatus = `${FieldNames.Client.dealStatus}-${clientStatusIndex !== -1 ? clientStatusIndex : 0}`;
    const carStatus = `${FieldNames.Car.status}-${carStatusIndex !== -1 ? carStatusIndex : 0}`;

    const res = await Promise.all([
      fieldChainService.updateById(clientStatusChain.id, clientStatusChain.fieldId, { value: clientStatus}),
      fieldChainService.updateById(carStatusChain.id,  clientStatusChain.fieldId, { value: carStatus}),
    ]);

    // TODO Delete all related carShowings

    return res;
  }
}

export = new ClientService();
