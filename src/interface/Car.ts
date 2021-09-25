export interface IField {
  id: number;
  flags: number;
  type: number;
  name: string;
  domain: number;
  variants: string;
  showUserLevel: number;
}

export type ResponseCar = {
  id: number; // system
  createdDate: number; // TODO?
  ownerId: number;
  fields: IField[];
} ;
