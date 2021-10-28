import { ServerClient } from "../entities/Client";
import { FieldDomains } from "../entities/Field";
import { Models } from "../entities/Models";
import clientRepository from "../repositories/base/client.repository";
import fieldChainRepository from "../repositories/base/field-chain.repository";
import { getFieldsWithValues } from "../utils/field.utils";
import fieldChainService from "./field-chain.service";
import fieldService from "./field.service";

class ClientService {
  async getAllClients(): Promise<ServerClient.GetResponse[]> {
    const [
      clients,
      relatedFields
    ] = await Promise.all([
      clientRepository.getAll(),
      fieldService.getFieldsByDomain(FieldDomains.Client)
    ]);

    const chaines = await fieldChainRepository.find({
      sourceId: clients.map(c => `${c.id}`),
      sourceName: [`'${Models.CLIENTS_TABLE_NAME}'`]
    });

    const result: ServerClient.GetResponse[] = clients.map(client => ({
      id: client.id,
      carIds: client.carIds,
      fields: getFieldsWithValues(relatedFields, chaines, client.id)
    }))

    return result;
  }

  async createClient(clientData: ServerClient.CreateRequest) {
    const client = await clientRepository.create({
      id: 0,
      carIds: clientData.carIds
    });

    await Promise.all(clientData.fields.map(f => fieldChainService.createFieldChain({
      id: 0,
      sourceId: client.id,
      fieldId: f.id,
      value: f.value,
      sourceName: Models.CLIENTS_TABLE_NAME
    })))

    return true;
  }

  async updateClient(id: number, clientData: ServerClient.CreateRequest) {
    const client = await clientRepository.updateById(id, {
      id: 0,
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

  async deleteClient(id: number) {
    const chaines = await fieldChainRepository.find({
      sourceId: [`${id}`],
      sourceName: [Models.CLIENTS_TABLE_NAME]
    });
    await Promise.all(chaines.map(ch => fieldChainService.deleteFieldChain(ch.id)));
    const client = await clientRepository.deleteById(id);
    return client
  }

  async getClient(id: number): Promise<ServerClient.GetResponse> {
    const client = await clientRepository.findById(id);
    const relatedFields = await fieldService.getFieldsByDomain(FieldDomains.Client);
    const chaines = await fieldChainRepository.find({
      sourceId: [`${id}`],
      sourceName: [`'${Models.CLIENTS_TABLE_NAME}'`]
    });

    const result: ServerClient.GetResponse = {
      id: client.id,
      carIds: client.carIds,
      fields: getFieldsWithValues(relatedFields, chaines, client.id)
    };

    return result;
  }
}

export = new ClientService();
