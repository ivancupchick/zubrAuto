import { ServerClient as client } from '../../../../src/temp/entities/Client';
import { FieldsUtils } from './field';
import { FieldNames } from './FieldNames';

export import ServerClient = client;

export function getDealStatus(client: ServerClient.Response): FieldNames.DealStatus {
  return FieldsUtils.getDropdownValue(client, FieldNames.Client.dealStatus) as FieldNames.DealStatus;
}

export function getClientStatus(client: ServerClient.Response): FieldNames.ClientStatus {
  return FieldsUtils.getDropdownValue(client, FieldNames.Client.clientStatus) as FieldNames.ClientStatus;
}

export function getClientSource(client: ServerClient.Response): FieldNames.ClientSource {
  return FieldsUtils.getDropdownValue(client, FieldNames.Client.source) as FieldNames.ClientSource;
}

export function getClientSpecialist(client: ServerClient.Response): string {
  return FieldsUtils.getFieldStringValue(client, FieldNames.Client.specialistId);
}
