import { Models } from "../entities/Models";
import { ServerPhoneCall } from "../entities/PhoneCall";
import { ICrudService } from "../entities/Types";
import { Webhook } from "../models/webhook";
import phoneCallsRepository from "../repositories/base/phone-calls.repository";


class PhoneCallService // implements ICrudService<ServerPhoneCall.CreateRequest, ServerPhoneCall.UpdateRequest, ServerPhoneCall.Response, ServerPhoneCall.IdResponse>
 {
  async webHookNotify(webhook: Webhook.Notification): Promise<ServerPhoneCall.IdResponse> {
    let existPhoneCall = null;
    if (webhook.notificationType === Webhook.NotificationType.State || webhook.notificationType === Webhook.NotificationType.Finish) {
      existPhoneCall = await phoneCallsRepository.findOne({
        innerNumber: [webhook.numberB],
        clientNumber: [webhook.numberA],
      });
    }

    if (webhook.notificationType === Webhook.NotificationType.Start || !existPhoneCall) {
      const date = webhook.notificationType === Webhook.NotificationType.Start
        ? webhook.date
        : (new Date()).toString();

      const crmCallType =  webhook.notificationType === Webhook.NotificationType.Start
        ? webhook.crmCallType
        : Webhook.CallType.Internal;

      const phoneCall: ServerPhoneCall.CreateRequest = {
        originalNotifications: JSON.stringify([webhook]),
        innerNumber: webhook.numberB,
        clientNumber: webhook.numberA,
        createdDate: +(new Date()),
        userId: null,
        originalDate: date,
        uuid: webhook.uuid,
        type: crmCallType,
        status: null,
        isFinished: false,
        recordUrl: null,
      }

      return await phoneCallsRepository.create(phoneCall);
    }

    if (webhook.notificationType === Webhook.NotificationType.State) {
      const phoneCall = await phoneCallsRepository.findOne({
        innerNumber: [webhook.numberB],
        clientNumber: [webhook.numberA],
      });

      if (phoneCall) {
        const oldNotifications: Webhook.Notification[] = JSON.parse(phoneCall.originalNotifications)
        phoneCall.originalNotifications = JSON.stringify([...oldNotifications, webhook]);

        return await phoneCallsRepository.updateById(phoneCall.id, phoneCall);
      }
    }

    if (webhook.notificationType === Webhook.NotificationType.Finish) {
      const phoneCall = await phoneCallsRepository.findOne({
        innerNumber: [webhook.numberB],
        clientNumber: [webhook.numberA],
      });

      if (phoneCall) {
        const oldNotifications: Webhook.Notification[] = JSON.parse(phoneCall.originalNotifications)
        phoneCall.originalNotifications = JSON.stringify([...oldNotifications, webhook]);

        phoneCall.status = webhook.crmCallFinishedStatus;
        phoneCall.isFinished = webhook.isCallFinished;
        phoneCall.recordUrl = webhook.fullUrl;

        return await phoneCallsRepository.updateById(phoneCall.id, phoneCall);
      }
    }

    return null;
  }

  // async getAll() {
  //   const [
  //     clients,
  //     relatedFields
  //   ] = await Promise.all([
  //     clientRepository.getAll(),
  //     fieldService.getFieldsByDomain(FieldDomains.Client)
  //   ]);

  //   return this.getClients(clients , relatedFields);
  // }

  // async getClients(clients: Models.Client[], clientsFields: ServerField.Response[]) {
  //   const chaines = clients.length > 0 ? await fieldChainRepository.find({
  //     sourceName: [`${Models.Table.Clients}`],
  //     sourceId: clients.map(c => `${c.id}`),
  //   }) : [];

  //   const result: ServerClient.Response[] = clients.map(client => ({
  //     id: client.id,
  //     carIds: client.carIds,
  //     fields: getFieldsWithValues(clientsFields, chaines, client.id)
  //   }))

  //   return result;
  // }

  // async getPhoneCallsByQuery(query: StringHash) {
  //   const {
  //     page,
  //     size,
  //   } = query;
  //   delete query['page'];
  //   delete query['size'];

  //   const searchClientsIds = await fieldChainService.getEntityIdsByQuery(
  //     Models.Table.Clients,
  //     FieldDomains.Client,
  //     query
  //   );

  //   let clientsIds = [...searchClientsIds];

  //   if (page && size) {
  //     const start = (+page - 1) * +size;

  //     clientsIds = clientsIds.slice(start, start + +size);
  //   }

  //   const clients = clientsIds.length > 0 ? await clientRepository.find({
  //     id: clientsIds
  //   }) : [];

  //   const [
  //     clientsFields,
  //   ] = await Promise.all([
  //     fieldService.getFieldsByDomain(FieldDomains.Client),
  //   ]);

  //   return this.getClients(clients, clientsFields);
  // }

  // async create(clientData: ServerPhoneCall.CreateRequest) {
  //   const client = await clientRepository.create({
  //     carIds: clientData.carIds
  //   });

  //   if (clientData.carIds && !Number.isNaN(+clientData.carIds)) { // TODO only one car
  //     await carStatisticService.addCall(clientData.carIds.split(',').map(id => +id));
  //   }

  //   await Promise.all(clientData.fields.map(f => fieldChainService.createFieldChain({
  //     sourceId: client.id,
  //     fieldId: f.id,
  //     value: f.value,
  //     sourceName: Models.Table.Clients
  //   })));

  //   return client;
  // }

  // async update(id: number, clientData: ServerClient.CreateRequest) {
  //   const client = await clientRepository.updateById(id, {
  //     carIds: clientData.carIds
  //   });

  //   const existsFieldChains = (await Promise.all(clientData.fields.map(f => fieldChainRepository.find({
  //     fieldId: [f.id].map(c => `${c}`),
  //     sourceId: [id].map(c => `${c}`),
  //     sourceName: [Models.Table.Clients]
  //   })))).reduce((prev, cur) => [...prev, ...cur], []);
  //   const existFieldIds = existsFieldChains.map(ef => +ef.fieldId);

  //   const existsFields = clientData.fields.filter(f => existFieldIds.includes(+f.id));
  //   const nonExistFields = clientData.fields.filter(f => !existFieldIds.includes(+f.id));

  //   existsFields.length > 0 && await Promise.all(existsFields.map(f => fieldChainRepository.update({
  //     value: f.value
  //   }, {
  //     fieldId: [f.id].map(c => `${c}`),
  //     sourceId: [id].map(c => `${c}`),
  //     sourceName: [Models.Table.Clients]
  //   })));

  //   nonExistFields.length > 0 && await Promise.all(nonExistFields.map(f => fieldChainRepository.create({
  //     fieldId: f.id,
  //     sourceId: id,
  //     sourceName: Models.Table.Clients,
  //     value: f.value,
  //   })));

  //   return client
  // }

  // async delete(id: number) {
  //   const chaines = await fieldChainRepository.find({
  //     sourceName: [Models.Table.Clients],
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
  //     sourceName: [`${Models.Table.Clients}`],
  //     sourceId: [`${id}`],
  //   });

  //   const result: ServerClient.Response = {
  //     id: client.id,
  //     carIds: client.carIds,
  //     fields: getFieldsWithValues(relatedFields, chaines, client.id)
  //   };

  //   return result;
  // }

  // async completeDeal(clientId: number, carId: number) {
  //   const [
  //     clientFields,
  //     carFields,
  //   ] = await Promise.all([
  //     fieldService.getFieldsByDomain(FieldDomains.Client),
  //     fieldService.getFieldsByDomain(FieldDomains.Car),
  //   ]);

  //   const clientStatusField = clientFields.find(cf => cf.name === FieldNames.Client.dealStatus);
  //   const carStatusField = carFields.find(cf => cf.name === FieldNames.Car.status);

  //   const [
  //     clientStatusChain,
  //     carStatusChain,
  //   ] = await Promise.all([
  //     fieldChainRepository.findOne({
  //       sourceName: [`${Models.Table.Clients}`],
  //       sourceId: [`${clientId}`],
  //       fieldId: [`${clientStatusField.id}`], }
  //     ),
  //     fieldChainRepository.findOne({
  //       sourceName: [`${Models.Table.Cars}`],
  //       sourceId: [`${carId}`],
  //       fieldId: [`${carStatusField.id}`], }
  //     ),
  //   ]);

  //   const clientStatusIndex = clientStatusField.variants.split(',').findIndex(v => v === FieldNames.DealStatus.Sold);
  //   const carStatusIndex = carStatusField.variants.split(',').findIndex(v => v === FieldNames.CarStatus.customerService_Sold);
  //   const clientStatus = `${FieldNames.Client.dealStatus}-${clientStatusIndex !== -1 ? clientStatusIndex : 0}`;
  //   const carStatus = `${FieldNames.Car.status}-${carStatusIndex !== -1 ? carStatusIndex : 0}`;

  //   const res = await Promise.all([
  //     fieldChainService.updateFieldChain(clientStatusChain.id, { value: clientStatus}),
  //     fieldChainService.updateFieldChain(carStatusChain.id, { value: carStatus}),
  //   ]);

  //   // TODO Delete all related carShowings

  //   return res;
  // }
}

export = new PhoneCallService();
