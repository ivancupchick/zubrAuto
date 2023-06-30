import { ServerClient } from "../entities/Client";
import { FieldDomains } from "../entities/Field";
import { FieldNames } from "../entities/FieldNames";
import { Models } from "../entities/Models";
import { ICrudService } from "../entities/Types";
import clientRepository from "../repositories/base/client.repository";
import fieldChainRepository from "../repositories/base/field-chain.repository";
import { getFieldsWithValues } from "../utils/field.utils";
import carStatisticService from "./car-statistic.service";
import fieldChainService from "./field-chain.service";
import fieldService from "./field.service";

// implements ICrudService<ServerClient.CreateRequest, ServerClient.UpdateRequest, ServerClient.Response, ServerClient.IdResponse>

class ActivityService {
  async getAll() {
    // const [
    //   clients,
    //   relatedFields
    // ] = await Promise.all([
    //   clientRepository.getAll(),
    //   fieldService.getFieldsByDomain(FieldDomains.Client)
    // ]);

    // const chaines = clients.length > 0 ? await fieldChainRepository.find({
    //   sourceName: [`${Models.CLIENTS_TABLE_NAME}`],
    //   sourceId: clients.map(c => `${c.id}`),
    // }) : [];

    // const result: ServerClient.Response[] = clients.map(client => ({
    //   id: client.id,
    //   carIds: client.carIds,
    //   fields: getFieldsWithValues(relatedFields, chaines, client.id)
    // }))

    // return result;
  }

  async create(clientData: ServerClient.CreateRequest) {
    // const client = await clientRepository.create({
    //   carIds: clientData.carIds
    // });

    // await carStatisticService.addCall(clientData.carIds.split(',').map(id => +id));

    // await Promise.all(clientData.fields.map(f => fieldChainService.createFieldChain({
    //   sourceId: client.id,
    //   fieldId: f.id,
    //   value: f.value,
    //   sourceName: Models.CLIENTS_TABLE_NAME
    // })))

    // return client;
  }

  async update(id: number, clientData: ServerClient.CreateRequest) {
    // const client = await clientRepository.updateById(id, {
    //   carIds: clientData.carIds
    // });

    // await Promise.all(clientData.fields.map(f => fieldChainRepository.update({
    //   value: f.value
    // }, {
    //   fieldId: [f.id].map(c => `${c}`),
    //   sourceId: [id].map(c => `${c}`),
    //   sourceName: [Models.CLIENTS_TABLE_NAME]
    // })))

    // return client
  }

  async delete(id: number) {
  //   const chaines = await fieldChainRepository.find({
  //     sourceName: [Models.CLIENTS_TABLE_NAME],
  //     sourceId: [`${id}`],
  //   });
  //   await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
  //   const client = await clientRepository.deleteById(id);
  //   return client
  // }

  // async get(id: number): Promise<ServerClient.Response> {
  //   const client = await clientRepository.findById(id);
  //   const relatedFields = await fieldService.getFieldsByDomain(FieldDomains.Client);
  //   const chaines = await fieldChainRepository.find({
  //     sourceName: [`${Models.CLIENTS_TABLE_NAME}`],
  //     sourceId: [`${id}`],
  //   });

  //   const result: ServerClient.Response = {
  //     id: client.id,
  //     carIds: client.carIds,
  //     fields: getFieldsWithValues(relatedFields, chaines, client.id)
  //   };

  //   return result;
  }

  async completeDeal(clientId: number, carId: number) {
    // const [
    //   clientFields,
    //   carFields,
    // ] = await Promise.all([
    //   fieldService.getFieldsByDomain(FieldDomains.Client),
    //   fieldService.getFieldsByDomain(FieldDomains.Car),
    // ]);

    // const clientStatusField = clientFields.find(cf => cf.name === FieldNames.Client.dealStatus);
    // const carStatusField = carFields.find(cf => cf.name === FieldNames.Car.status);

    // const [
    //   clientStatusChain,
    //   carStatusChain,
    // ] = await Promise.all([
    //   fieldChainRepository.findOne({
    //     sourceName: [`${Models.CLIENTS_TABLE_NAME}`],
    //     sourceId: [`${clientId}`],
    //     fieldId: [`${clientStatusField.id}`], }
    //   ),
    //   fieldChainRepository.findOne({
    //     sourceName: [`${Models.CARS_TABLE_NAME}`],
    //     sourceId: [`${carId}`],
    //     fieldId: [`${carStatusField.id}`], }
    //   ),
    // ]);

    // const clientStatusIndex = clientStatusField.variants.split(',').findIndex(v => v === FieldNames.DealStatus.Sold);
    // const carStatusIndex = carStatusField.variants.split(',').findIndex(v => v === FieldNames.CarStatus.customerService_Sold);
    // const clientStatus = `${FieldNames.Client.dealStatus}-${clientStatusIndex !== -1 ? clientStatusIndex : 0}`;
    // const carStatus = `${FieldNames.Car.status}-${carStatusIndex !== -1 ? carStatusIndex : 0}`;

    // const res = await Promise.all([
    //   fieldChainService.updateFieldChain(clientStatusChain.id, { value: clientStatus}),
    //   fieldChainService.updateFieldChain(carStatusChain.id, { value: carStatus}),
    // ]);

    // // TODO Delete all related carShowings

    // return res;
  }
}

export = new ActivityService();
