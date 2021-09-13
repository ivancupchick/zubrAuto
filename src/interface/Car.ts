export interface RequestCar {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  created_at: Date;
}

export interface IOwner {
  ownerName: string;
  number: string;
  notes: string;
}

export interface IField {
  name: string;
  title: string;
  type: string;
}

export interface ICar {
  id: number; // system
  name: string; // system?
  title: string;
  status: string;
  fields: IField[];
}

export type ResponseCar = ICar & IOwner;