import { ServerClient as client } from '../../../../src/entities/Client';
import { FieldsUtils } from './field';
import { FieldNames } from './FieldNames';

export import ServerClient = client;

export function getClientStatus(car: ServerClient.Response): FieldNames.DealStatus {
  return FieldsUtils.getDropdownValue(car, FieldNames.Client.dealStatus) as FieldNames.DealStatus;
}
