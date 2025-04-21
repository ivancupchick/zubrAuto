import { Injectable } from '@nestjs/common';
import { CreateChangeLogDto } from './dto/create-change-log.dto';
import { UpdateChangeLogDto } from './dto/update-change-log.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ServerActivity } from 'src/temp/entities/Activity';
import { Models } from 'src/temp/entities/Models';
import { StringHash } from 'src/temp/models/hashes';
import { getEntityIdsByNaturalQuery } from 'src/core/utils/enitities-functions';
import { ApiError } from 'src/core/exceptions/api.error';

@Injectable()
export class ChangeLogService {
  constructor(private prisma: PrismaService) {}

  async createActivity(
    createChangeLogDto: CreateChangeLogDto,
  ): Promise<ServerActivity.Response> {
    // const callRequest: ServerActivity.CreateRequest = {
    //   originalNotification: JSON.stringify(sitesCallRequest),
    //   innerNumber: '',
    //   clientNumber: convertClientNumber(sitesCallRequest.number) || sitesCallRequest.number,
    //   createdDate: +(new Date()),
    //   userId: +id || null,
    //   comment: sitesCallRequest.comment,
    //   source: sitesCallRequest.source,
    // }
    const activity: CreateChangeLogDto = Object.assign(createChangeLogDto);

    return await this.prisma.activities.create({ data: activity });
  }

  async findAll() {
    const [entities] = await Promise.all([this.prisma.activities.findMany()]);

    return this.getEntities(entities) as any; // TODO
  }

  async getEntities(requests: Models.Activity[]) {
    return requests;
  }

  async findMany(query: StringHash) {
    const { page, size, sortOrder } = query;
    delete query['page'];
    delete query['size'];

    const searchEntitiesIds = await getEntityIdsByNaturalQuery(
      this.prisma.activities,
      query,
    );

    let entitiesIds = [...searchEntitiesIds];

    if (page && size) {
      const start = (+page - 1) * +size;

      entitiesIds = entitiesIds.slice(start, start + +size);
    }

    const requests =
      entitiesIds.length > 0
        ? await this.prisma.activities.findMany({
            where: { id: { in: entitiesIds } },
          })
        : [];

    let list = await this.getEntities(requests);

    if (sortOrder === 'DESC') {
      list = list.reverse();
    }

    return {
      list: list,
      total: searchEntitiesIds.length,
    };
  }

  async create(createChangeLogDto: CreateChangeLogDto) {
    const entity = await this.prisma.activities.create({
      data: createChangeLogDto,
    });

    return entity;
  }

  async findOne(id: number) {
    const entity = await this.prisma.activities.findUnique({ where: { id } });

    return entity;
  }

  async update(id: number, updateChangeLogDto: UpdateChangeLogDto) {
    const entity = await this.prisma.activities.update({
      where: { id },
      data: updateChangeLogDto,
    });

    return entity;
  }

  async remove(id: number) {
    throw new ApiError(404, `changeLog removeing is restricted`);
  }
}
