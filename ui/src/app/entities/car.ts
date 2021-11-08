import { ServerCar } from '../../../../src/entities/Car'
import { FieldsUtils } from './field';
import { FieldNames } from './FieldNames';

// export interface IOwner {
//   ownerName: string;
//   number: string;
//   notes: string;
// }

// export interface IField {
//   name: string;
//   title: string;
//   type: string;
// }

// export interface ICar {
//   id: number; // system
//   name: string; // system?
//   title: string;
//   status: string;
//   fields: IField[];
// }

export import ServerCar = ServerCar;

export function getCarStatus(car: ServerCar.Response): string {
  return FieldsUtils.getDropdownValue(car, FieldNames.Car.status);
}

// export {
//   Car
// };
