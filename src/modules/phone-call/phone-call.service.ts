import { Injectable } from '@nestjs/common';
import { CreatePhoneCallDto } from './dto/create-phone-call.dto';
import { UpdatePhoneCallDto } from './dto/update-phone-call.dto';
import { Webhook } from 'src/temp/models/webhook';
import { ServerPhoneCall } from 'src/temp/entities/PhoneCall';
import { PrismaService } from 'src/prisma/prisma.service';
import { JSONparse } from 'src/core/utils/json.util';
import { Models } from 'src/temp/entities/Models';
import { StringHash } from 'src/temp/models/hashes';
import { getEntityIdsByNaturalQuery } from 'src/core/utils/enitities-functions';
import { Prisma } from '@prisma/client';

@Injectable()
export class PhoneCallService {
  constructor(private prisma: PrismaService) {}

  async webHookNotify(webhook: Webhook.Notification): Promise<ServerPhoneCall.IdResponse> {
    let existPhoneCall = null;
    if (webhook.notificationType === Webhook.NotificationType.State || webhook.notificationType === Webhook.NotificationType.Finish) {
      existPhoneCall = await this.prisma.phoneCalls.findFirst({ where: {
        innerNumber: webhook.numberB,
        clientNumber: webhook.numberA,
      }});
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
        createdDate: BigInt(+(new Date())),
        userId: null,
        originalDate: date,
        uuid: webhook.uuid,
        type: crmCallType,
        status: null,
        isFinished: false,
        recordUrl: null,
        isUsed: false,
      }

      return await this.prisma.phoneCalls.create({data:phoneCall});
    }

    if (webhook.notificationType === Webhook.NotificationType.State) {
      const phoneCall = await this.prisma.phoneCalls.findFirst({ where: {
        innerNumber: webhook.numberB,
        clientNumber: webhook.numberA,
      }});

      if (phoneCall) {
        const oldNotifications: Webhook.Notification[] = JSONparse<Webhook.Notification[]>(phoneCall.originalNotifications) || [];
        phoneCall.originalNotifications = JSON.stringify([...oldNotifications, webhook]);

        return await this.prisma.phoneCalls.update({ where: { id: phoneCall.id }, data: phoneCall});
      }
    }

    if (webhook.notificationType === Webhook.NotificationType.Finish) {
      const phoneCall = await this.prisma.phoneCalls.findFirst({ where: {
        innerNumber: webhook.numberB,
        clientNumber: webhook.numberA,
      }});

      if (phoneCall) {
        const oldNotifications: Webhook.Notification[] = JSONparse<Webhook.Notification[]>(phoneCall.originalNotifications) || [];
        phoneCall.originalNotifications = JSON.stringify([...oldNotifications, webhook]);

        phoneCall.status = webhook.crmCallFinishedStatus;
        phoneCall.isFinished = webhook.isCallFinished;
        phoneCall.recordUrl = webhook.fullUrl;

        return await this.prisma.phoneCalls.update({ where: { id: phoneCall.id }, data: phoneCall});
      }
    }

    return null;
  }

  async findAll() {
    const [
      requests,
    ] = await Promise.all([
      this.prisma.phoneCalls.findMany(),
    ]);

    return this.getEntities(requests) as any; // TODO
  }

  async getEntities(entities: Models.PhoneCall[]) {
    return entities;
  }

  async findMany(query: StringHash) { // TODO type
    const {
      page,
      size,
      sortOrder,
    } = query;
    delete query['page'];
    delete query['size'];

    const searchEntitiesIds = await getEntityIdsByNaturalQuery(
      this.prisma.phoneCalls,
      query
    );

    let entitiesIds = [...searchEntitiesIds];

    if (page && size) {
      const start = (+page - 1) * +size;

      entitiesIds = entitiesIds.slice(start, start + +size);
    }

    const requests = entitiesIds.length > 0 ? await this.prisma.phoneCalls.findMany({ where: {
      id: { in: entitiesIds }
    }}) : [];

    let list = await this.getEntities(requests);

    if (sortOrder === Prisma.SortOrder.desc) {
      list = list.reverse();
    }

    return {
      list: list,
      total: searchEntitiesIds.length
    };
  }

  create(createPhoneCallDto: CreatePhoneCallDto) {
    return 'This action adds a new phoneCall';
  }


  async findOne(id: number) {
    const phoneCall = await this.prisma.phoneCalls.findUnique({where:{id}});

    return phoneCall;
  }

  async update(id: number, updatePhoneCallDto: UpdatePhoneCallDto) {
    const phoneCall = await this.prisma.phoneCalls.update({ where: {id}, data: updatePhoneCallDto});

    return phoneCall
  }

  async remove(id: number) {
    const phoneCall = await this.prisma.phoneCalls.delete({where: {id}});
    return phoneCall
  }
}
