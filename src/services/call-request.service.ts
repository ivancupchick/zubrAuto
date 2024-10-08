import { ServerCallRequest } from "../entities/CallRequest";
import { Models } from "../entities/Models";
import { ICrudService } from "../entities/Types";
import { ApiError } from "../exceptions/api.error";
import { StringHash } from "../models/hashes";
import { SitesCallRequest } from "../models/sites-call-request";
import callRequestsRepository from "../repositories/base/call-requests.repository";
import fieldChainRepository from "../repositories/base/field-chain.repository";
import userRepository from "../repositories/base/user.repository";
import { getEntityIdsByNaturalQuery } from "../utils/enitities-functions";
import { convertClientNumber } from "../utils/number.utils";

class CallRequestService implements ICrudService<ServerCallRequest.CreateRequest, ServerCallRequest.UpdateRequest, ServerCallRequest.Response, ServerCallRequest.IdResponse>
 {
  async callRequest(sitesCallRequest: SitesCallRequest): Promise<ServerCallRequest.IdResponse> {
    let users = await fieldChainRepository.findWithValue({
      fieldId: [50].map(c => `${c}`),
      sourceName: [Models.Table.Users],
    }, [sitesCallRequest.source]);

    if (!users.length) {
      users = await fieldChainRepository.findWithValue({
        fieldId: [50].map(c => `${c}`),
        sourceName: [Models.Table.Users],
      }, ['all']);
    }

    let userIds = users.map(ef => +ef.sourceId);

    const existUsers = await userRepository.find({ id: userIds.map(id => `${id}`), deleted: ['0'] });

    userIds = existUsers.map(u => +u.id);

    const allRequests = await callRequestsRepository.find({
      userId: userIds.map(id => `${id}`)
    }, 'createdDate', 'DESC');

    let id = 0;

    if (!allRequests.length) {
      id = userIds[0];
    } else {
      const lastUserIndex = userIds.findIndex(id => +id === +allRequests[0].userId);
      id = userIds[lastUserIndex + 1] || userIds[0];
    }

    const callRequest: ServerCallRequest.CreateRequest = {
      originalNotification: JSON.stringify(sitesCallRequest),
      innerNumber: '',
      clientNumber: convertClientNumber(sitesCallRequest.number) || sitesCallRequest.number,
      createdDate: +(new Date()),
      userId: +id || null,
      comment: sitesCallRequest.comment,
      source: sitesCallRequest.source,
      isUsed: 0,
    }

    return await callRequestsRepository.create(callRequest);
  }

  async getAll() {
    const [
      requests,
    ] = await Promise.all([
      callRequestsRepository.getAll(),
    ]);

    return this.getCallRequests(requests) as any; // TODO
  }

  async getCallRequests(requests: Models.CallRequest[]) {

    return requests;
  }

  async getCallRequestsByQuery(query: StringHash) {
    const {
      page,
      size,
      sortOrder,
    } = query;
    delete query['page'];
    delete query['size'];

    const searchCallRequestsIds = await getEntityIdsByNaturalQuery(
      callRequestsRepository,
      query
    );

    let callRequestsIds = [...searchCallRequestsIds];

    if (page && size) {
      const start = (+page - 1) * +size;

      callRequestsIds = callRequestsIds.slice(start, start + +size);
    }

    const requests = callRequestsIds.length > 0 ? await callRequestsRepository.find({
      id: callRequestsIds
    }) : [];

    let list = await this.getCallRequests(requests);

    if (sortOrder === 'DESC') {
      list = list.reverse();
    }

    return {
      list: list,
      total: searchCallRequestsIds.length
    };
  }

  async create(callRequestData: ServerCallRequest.CreateRequest) {
    throw new ApiError(408, 'Create is not available');

    return null;
  }

  async update(id: number, callRequestData: ServerCallRequest.UpdateRequest) {
    const callRequest = await callRequestsRepository.updateById(id, callRequestData);

    return callRequest
  }

  async delete(id: number) {
    const callRequest = await callRequestsRepository.deleteById(id);
    return callRequest
  }

  async get(id: number): Promise<ServerCallRequest.Response> {
    const callRequest = await callRequestsRepository.findById(id);

    return callRequest;
  }
}

export = new CallRequestService();
