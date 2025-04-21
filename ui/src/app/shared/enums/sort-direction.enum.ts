export enum ZASortDirection {
  Asc = 'asc',
  Desc = 'desc',
}

export const SortEventDirection: {
  [key: number]: ZASortDirection;
} = {
  [1]: ZASortDirection.Asc,
  [-1]: ZASortDirection.Desc,
};
