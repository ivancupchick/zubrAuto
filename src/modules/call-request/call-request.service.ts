import { Injectable } from '@nestjs/common';
import { CreateCallRequestDto } from './dto/create-call-request.dto';
import { UpdateCallRequestDto } from './dto/update-call-request.dto';
import { Models } from 'src/temp/entities/Models';
import { PrismaService } from 'src/prisma/prisma.service';
import { getEntityIdsByNaturalQuery } from 'src/core/utils/enitities-functions';
import { StringHash } from 'src/temp/models/hashes';
import { SitesCallRequest } from 'src/temp/models/sites-call-request';
import { Prisma } from '@prisma/client';
import { ServerCallRequest } from 'src/temp/entities/CallRequest';
import { convertClientNumber } from 'src/core/utils/number.utils';

@Injectable()
export class CallRequestService {
  constructor(private prisma: PrismaService) {}

  async callRequest(sitesCallRequest: SitesCallRequest) {
    let users = await this.prisma.fieldIds.findMany({
      where: {
        fieldId: 50, // fieldId for source // TODO add request a fieldId
        sourceName: Models.Table.Users,
        value: sitesCallRequest.source,
      },
    });

    if (!users.length) {
      users = await this.prisma.fieldIds.findMany({
        where: {
          fieldId: 50, // fieldId for source // TODO add request a fieldId
          sourceName: Models.Table.Users,
          value: 'all',
        },
      });
    }

    let userIds = users.map((ef) => +ef.sourceId);

    const existUsers = await this.prisma.users.findMany({
      where: { id: { in: userIds }, deleted: false },
    });

    userIds = existUsers.map((u) => +u.id);

    const allRequests = await this.prisma.callRequests.findMany({
      where: {
        userId: { in: userIds },
      },
      orderBy: { createdDate: Prisma.SortOrder.desc },
    });

    let id = 0;

    if (!allRequests.length) {
      id = userIds[0];
    } else {
      const lastUserIndex = userIds.findIndex(
        (id) => +id === +allRequests[0].userId,
      );
      id = userIds[lastUserIndex + 1] || userIds[0];
    }

    const callRequest: ServerCallRequest.CreateRequest = {
      originalNotification: JSON.stringify(sitesCallRequest),
      innerNumber: '',
      clientNumber:
        convertClientNumber(sitesCallRequest.number) || sitesCallRequest.number,
      createdDate: BigInt(+new Date()),
      userId: +id || null,
      comment: sitesCallRequest.comment,
      source: sitesCallRequest.source,
      isUsed: false,
    };

    return await this.prisma.callRequests.create({ data: callRequest });
  }

  async create(createCallRequestDto: CreateCallRequestDto) {
    return 'This action adds a new callRequest';
  }

  async findAll() {
    const [requests] = await Promise.all([this.prisma.callRequests.findMany()]);

    return this.getCallRequests(requests) as any; // TODO BaseList
  }

  async getCallRequests(requests: Models.CallRequest[]) {
    return requests;
  }

  async findMany(query: StringHash) {
    const { page, size, sortOrder } = query;
    delete query['page'];
    delete query['size'];

    const searchCallRequestsIds = await getEntityIdsByNaturalQuery(
      this.prisma.callRequests,
      query,
    );

    let callRequestsIds = [...searchCallRequestsIds];

    if (page && size) {
      const start = (+page - 1) * +size;

      callRequestsIds = callRequestsIds.slice(start, start + +size);
    }

    const requests =
      callRequestsIds.length > 0
        ? await this.prisma.callRequests.findMany({
            where: {
              id: { in: callRequestsIds },
            },
          })
        : [];

    let list = await this.getCallRequests(requests);

    if (sortOrder === Prisma.SortOrder.desc) {
      list = list.reverse();
    }

    return {
      list: list,
      total: searchCallRequestsIds.length,
    };
  }

  async findOne(id: number) {
    const callRequest = await this.prisma.callRequests.findUnique({
      where: { id },
    });

    return callRequest;
  }

  async update(id: number, updateCallRequestDto: UpdateCallRequestDto) {
    const callRequest = await this.prisma.callRequests.update({
      where: { id },
      data: updateCallRequestDto,
    });

    return callRequest;
  }

  async remove(id: number) {
    const callRequest = await this.prisma.callRequests.delete({
      where: { id },
    });
    return callRequest;
  }
}
