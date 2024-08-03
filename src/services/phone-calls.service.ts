import { Models } from "../entities/Models";
import { ServerPhoneCall } from "../entities/PhoneCall";
import { ICrudService } from "../entities/Types";
import { ApiError } from "../exceptions/api.error";
import { StringHash } from "../models/hashes";
import { Webhook } from "../models/webhook";
import phoneCallsRepository from "../repositories/base/phone-calls.repository";
import { getEntityIdsByNaturalQuery } from "../utils/enitities-functions";


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

  async getAll() {
    const [
      requests,
    ] = await Promise.all([
      phoneCallsRepository.getAll(),
    ]);

    return this.getEntities(requests) as any; // TODO
  }

  async getEntities(entities: Models.PhoneCall[]) {

    return entities;
  }

  async getPhoneCallsByQuery(query: StringHash) {
    const {
      page,
      size,
    } = query;
    delete query['page'];
    delete query['size'];

    const sortOrder = 'DESC';
    query['sortOrder'] = 'DESC';
    query['sortField'] = 'id';

    const searchEntitiesIds = await getEntityIdsByNaturalQuery(
      phoneCallsRepository,
      query
    );

    let entitiesIds = [...searchEntitiesIds];

    if (page && size) {
      const start = (+page - 1) * +size;

      entitiesIds = entitiesIds.slice(start, start + +size);
    }

    const requests = entitiesIds.length > 0 ? await phoneCallsRepository.find({
      id: entitiesIds
    }) : [];

    let list = await this.getEntities(requests);

    if (sortOrder === 'DESC') {
      list = list.reverse();
    }

    return {
      list: list,
      total: searchEntitiesIds.length
    };
  }

  async create(phoneCallData: ServerPhoneCall.CreateRequest) {
    throw new ApiError(408, 'Create is not available');

    return null;
  }

  async update(id: number, phoneCallData: ServerPhoneCall.UpdateRequest) {
    const phoneCall = await phoneCallsRepository.updateById(id, phoneCallData);

    return phoneCall
  }

  async delete(id: number) {
    const phoneCall = await phoneCallsRepository.deleteById(id);
    return phoneCall
  }

  async get(id: number): Promise<ServerPhoneCall.Response> {
    const phoneCall = await phoneCallsRepository.findById(id);

    return phoneCall;
  }
}

export = new PhoneCallService();
