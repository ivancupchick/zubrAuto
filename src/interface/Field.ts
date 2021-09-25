export interface IField {
  id: number;
  flags: number;
  type: number;
  name: string;
  domain: number;
  variants?: string;
  showUserLevel: number;
}

export interface CreateField {
  flags: number;
  type: number;
  name: string;
  domain: number;
  variants?: string;
  showUserLevel: number;
}
