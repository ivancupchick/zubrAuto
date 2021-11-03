export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>>
  & {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
  }[Keys];

export type ICrudService<TUpdate, TCreate, TResponse, TIdResponse> = {
  get: (id: number) => Promise<TResponse>;
  getAll: () => Promise<TResponse[]>;
  create: (data: TCreate) => Promise<TIdResponse>;
  update: (id: number, data: TUpdate) => Promise<TIdResponse>;
  delete: (id: number) => Promise<TIdResponse>;
}
