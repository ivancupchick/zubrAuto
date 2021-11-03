import { ServerClient } from "../entities/Client";
import { FieldDomains } from "../entities/Field";
import { Models } from "../entities/Models";
import { ICrudService } from "../entities/Types";
import clientRepository from "../repositories/base/client.repository";
import fieldChainRepository from "../repositories/base/field-chain.repository";
import { getFieldsWithValues } from "../utils/field.utils";
import fieldChainService from "./field-chain.service";
import fieldService from "./field.service";

class ClientService implements ICrudService<ServerClient.CreateRequest, ServerClient.UpdateRequest, ServerClient.Response, ServerClient.IdResponse> {
  async getAll() {
    const [
      clients,
      relatedFields
    ] = await Promise.all([
      clientRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.Client)
    ]);

    const chaines = await fieldChainRepository.find({
      sourceId: clients.map(c => `${c.id}`),
      sourceName: [`${Models.CLIENTS_TABLE_NAME}`]
    });

    const result: ServerClient.Response[] = clients.map(client => ({
      id: client.id,
      carIds: client.carIds,
      fields: getFieldsWithValues(relatedFields, chaines, client.id)
    }))

    return result;
  }

  async create(clientData: ServerClient.CreateRequest) {
    const client = await clientRepository.create({
      carIds: clientData.carIds
    });

    await Promise.all(clientData.fields.map(f => fieldChainService.createFieldChain({
      sourceId: client.id,
      fieldId: f.id,
      value: f.value,
      sourceName: Models.CLIENTS_TABLE_NAME
    })))

    return client;
  }

  async update(id: number, clientData: ServerClient.CreateRequest) {
    const client = await clientRepository.updateById(id, {
      carIds: clientData.carIds
    });

    await Promise.all(clientData.fields.map(f => fieldChainRepository.update({
      value: f.value
    }, {
      fieldId: [f.id].map(c => `${c}`),
      sourceId: [id].map(c => `${c}`),
      sourceName: [Models.CLIENTS_TABLE_NAME]
    })))

    return client
  }

  async delete(id: number) {
    const chaines = await fieldChainRepository.find({
      sourceId: [`${id}`],
      sourceName: [Models.CLIENTS_TABLE_NAME]
    });
    await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
    const client = await clientRepository.deleteById(id);
    return client
  }

  async get(id: number): Promise<ServerClient.Response> {
    const client = await clientRepository.findById(id);
    const relatedFields = await fieldService.getFieldsByDomain(FieldDomains.Client);
    const chaines = await fieldChainRepository.find({
      sourceId: [`${id}`],
      sourceName: [`${Models.CLIENTS_TABLE_NAME}`]
    });

    const result: ServerClient.Response = {
      id: client.id,
      carIds: client.carIds,
      fields: getFieldsWithValues(relatedFields, chaines, client.id)
    };

    return result;
  }
}

export = new ClientService();
