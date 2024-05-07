import { ServerActivity } from "../entities/Activities";
import { Models } from "../entities/Models";
import { ICrudService } from "../entities/Types";
import { ActivityType } from "../enums/activity-type.enum";
import { ApiError } from "../exceptions/api.error";
import { StringHash } from "../models/hashes";
import activitiesRepository from "../repositories/base/activities.repository";
import { getEntityIdsByNaturalQuery } from "../utils/enitities-functions";


class ActivityService implements ICrudService<ServerActivity.CreateRequest, ServerActivity.UpdateRequest, ServerActivity.Response, ServerActivity.IdResponse> {
  async createActivity(activityData: ServerActivity.CreateRequest): Promise<ServerActivity.IdResponse> {
    // const callRequest: ServerActivity.CreateRequest = {
    //   originalNotification: JSON.stringify(sitesCallRequest),
    //   innerNumber: '',
    //   clientNumber: convertClientNumber(sitesCallRequest.number) || sitesCallRequest.number,
    //   createdDate: +(new Date()),
    //   userId: +id || null,
    //   comment: sitesCallRequest.comment,
    //   source: sitesCallRequest.source,
    // }
    const activity = Object.assign(activityData);

    return await activitiesRepository.create(activity);
  }

  async getAll() {
    const [
      entities,
    ] = await Promise.all([
      activitiesRepository.getAll(),
    ]);

    return this.getEntities(entities);
  }

  async getEntities(requests: Models.Activity[]) {

    return requests;
  }

  async getEntitiesByQuery(query: StringHash) {
    const {
      page,
      size,
    } = query;
    delete query['page'];
    delete query['size'];

    const searchEntitiesIds = await getEntityIdsByNaturalQuery(
      activitiesRepository.find,
      query
    );

    let entitiesIds = [...searchEntitiesIds];

    if (page && size) {
      const start = (+page - 1) * +size;

      entitiesIds = entitiesIds.slice(start, start + +size);
    }

    const requests = entitiesIds.length > 0 ? await activitiesRepository.find({
      id: entitiesIds
    }) : [];

    return this.getEntities(requests);
  }

  async create(activityData: ServerActivity.CreateRequest) {
    const entity = await activitiesRepository.create(activityData);

    return entity;
  }

  async update(id: number, activityData: ServerActivity.UpdateRequest) {
    const entity = await activitiesRepository.updateById(id, activityData);

    return entity
  }

  async delete(id: number) {
    const entity = await activitiesRepository.deleteById(id);
    return entity
  }

  async get(id: number): Promise<ServerActivity.Response> {
    const entity = await activitiesRepository.findById(id);

    return entity;
  }
}

export = new ActivityService();
