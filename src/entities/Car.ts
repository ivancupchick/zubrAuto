import { RealField } from "./Field";

export type ResponseCar = {
  id: number; // system
  createdDate: number; // TODO?
  ownerId: number;
  fields: RealField.Response[];
};
